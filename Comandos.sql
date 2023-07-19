/*
	CARDINALIDADES
	
	ENDERECO (1,N) - (1,1) CLIENTE
	TELEFONE (1,N) - (1,1) CLIENTE
	PEDIDO   (1,1) - (0,1) CLIENTE
	CATEGORIA(1,N) - (1,1) PRODUTO
	PRODUTO  (0,N) - (1,N) ITEM_PEDIDO
	PEDIDO	 (1,N) - (1,N) ITEM_PEDIDO
	PEDIDO   (1,1) - (0,N) PAGAMENTO
*/

-- 	CRIAR BANCO DE DADOS
CREATE DATABASE 'C:\BD\BANCO-TESTE.FDB' USER 'SYSDBA' PASSWORD 'MASTERKEY';

-- CONECTAR NO BANCO DE DADOS
CONNECT 'C:\BD\BANCO-TESTE.FDB' USER 'SYSDBA' PASSWORD 'MASTERKEY';

-- TABELAS
CREATE TABLE CLIENTE(
	IDCLIENTE		INTEGER NOT NULL,	-- CHAVE PRIMÁRIA
	NOME			VARCHAR(30),
	CPF				VARCHAR(14),
	SEXO			CHAR(1) CHECK(SEXO IN ('F', 'M')),
	DT_NASCIMENTO	DATE
);

CREATE TABLE TELEFONE(
	IDTELEFONE		INTEGER NOT NULL,	-- CHAVE PRIMÁRIA
	IDCLIENTE		INTEGER,			-- CHAVE ESTRANGEIRA
	TELEFONE		VARCHAR(19)
);

CREATE TABLE ENDERECO(
	IDENDERECO		INTEGER NOT NULL,	-- CHAVE PRIMÁRIA
	IDCLIENTE		INTEGER,			-- CHAVE ESTRANGEIRA
	RUA				VARCHAR(30),
	NUMERO			VARCHAR(10),
	BAIRRO			VARCHAR(30),
	CEP				VARCHAR(12),
	CIDADE			VARCHAR(20),
	ESTADO			CHAR(2)
);

CREATE TABLE PRODUTO(
	IDPRODUTO		INTEGER NOT NULL,	-- CHAVE PRIMÁRIA
	IDCATEGORIA		INTEGER,			-- CHAVE ESTRANGEIRA
	NOME			VARCHAR(20),
	PRECO			NUMERIC(12, 2),
	QUANTIDADE		INTEGER,
	DESCRICAO		VARCHAR(3000)
);

CREATE TABLE PEDIDO(
	IDPEDIDO		INTEGER NOT NULL,	-- CHAVE PRIMÁRIA
	IDCLIENTE		INTEGER,			-- CHAVE ESTRANGEIRA
	IDITEMPEDIDO	INTEGER				-- CHAVE ESTRANGEIRA
);

CREATE TABLE ITEM_PEDIDO(
	IDITEM_PEDIDO	INTEGER NOT NULL,	-- CHAVE PRIMÁRIA
	IDPEDIDO		INTEGER				-- CHAVE ESTRANGEIRA
	IDPRODUTO		INTEGER,			-- CHAVE ESTRANGEIRA
	PRECO_UNITARIO	NUMERIC(12,2),
	QUANTIDADE		INTEGER,
	DESCONTOS		NUMERIC(12,2),
	TOTAL			NUMERIC(12,2)
);

CREATE TABLE PAGAMENTO(
	IDPAGAMENTO		INTEGER NOT NULL,	-- CHAVE PRIMÁRIA
	IDPEDIDO 		INTEGER,			-- CHAVE ESTRANGEIRA
	TIPO			CHAR(3) CHECK(TIPO IN ('DH', 'CC', 'CD', 'TB', 'BB', 'PX', 'CQ', 'PP'))
);

CREATE TABLE CATEGORIA(
	IDCATEGORIA		INTEGER NOT NULL,	-- CHAVE PRIMÁRIA
	NOME			VARCHAR(20)
);

-- SEQUÊNCIAS
CREATE SEQUENCE SEQ_CLIENTE;
CREATE SEQUENCE SEQ_TELEFONE;
CREATE SEQUENCE SEQ_ENDERECO;
CREATE SEQUENCE SEQ_PRODUTO;
CREATE SEQUENCE SEQ_PEDIDO;
CREATE SEQUENCE SEQ_PAGAMENTO;
CREATE SEQUENCE SEQ_CATEGORIA;

-- CRIAR CHAVES PRIMÁRIAS
ALTER TABLE CLIENTE 	ADD CONSTRAINT PK_IDCLIENTE 	PRIMARY KEY(IDCLIENTE);
ALTER TABLE TELEFONE	ADD CONSTRAINT PK_IDTELEFONE 	PRIMARY KEY(IDTELEFONE);
ALTER TABLE ENDERECO 	ADD CONSTRAINT PK_IDENDERECO 	PRIMARY KEY(IDENDERECO);
ALTER TABLE PRODUTO 	ADD CONSTRAINT PK_IDPRODUTO 	PRIMARY KEY(IDPRODUTO);
ALTER TABLE PEDIDO 		ADD CONSTRAINT PK_IDPEDIDO 		PRIMARY KEY(IDPEDIDO);
ALTER TABLE PAGAMENTO 	ADD CONSTRAINT PK_IDPAGAMENTO	PRIMARY KEY(IDPAGAMENTO);
ALTER TABLE CATEGORIA 	ADD CONSTRAINT PK_IDCATEGORIA 	PRIMARY KEY(IDCATEGORIA);
ALTER TABLE ITEM_PEDIDO ADD CONSTRAINT PK_IDITEM_PEDIDO PRIMARY KEY(IDITEM_PEDIDO);

-- CRIANDO CHAVES ESTRANGEIRAS
ALTER TABLE CLIENTE		ADD CONSTRAINT FK_IDENDERECO_CLIENTE	FOREIGN KEY(IDENDERECO) 	REFERENCES ENDERECO		(IDENDERECO);
ALTER TABLE TELEFONE	ADD CONSTRAINT FK_IDCLIENTE_TELEFONE	FOREIGN KEY(IDCLIENTE) 		REFERENCES CLIENTE 		(IDCLIENTE);
ALTER TABLE ENDERECO	ADD CONSTRAINT FK_IDCLIENTE_ENDERECO	FOREIGN KEY(IDCLIENTE) 		REFERENCES CLIENTE 		(IDCLIENTE);
ALTER TABLE PEDIDO		ADD CONSTRAINT FK_IDCLIENTE_PEDIDO		FOREIGN KEY(IDCLIENTE) 		REFERENCES CLIENTE 		(IDCLIENTE);
ALTER TABLE PEDIDO		ADD CONSTRAINT FK_IDPRODUTO_PEDIDO		FOREIGN KEY(IDPRODUTO) 		REFERENCES PRODUTO 		(IDPRODUTO);
ALTER TABLE PEDIDO 		ADD CONSTRAINT FK_IDITEMPEDIDO 			FOREIGN KEY(IDITEMPEDIDO) 	REFERENCES ITEM_PEDIDO	(IDITEM_PEDIDO);
ALTER TABLE ITEM_PEDIDO ADD CONSTRAINT FK_IDPRODUTO 			FOREIGN KEY(IDPRODUTO) 		REFERENCES PRODUTO 		(IDPRODUTO); 
ALTER TABLE PAGAMENTO 	ADD CONSTRAINT FK_PAGAMENTO 			FOREIGN KEY(IDPAGAMENTO)	REFERENCES PAGAMENTO	(IDPAGAMENTO);
ALTER TABLE PRODUTO 	ADD CONSTRAINT FK_IDCATEGORIA 			FOREIGN KEY(IDCATEGORIA) 	REFERENCES CATEGORIA	(IDCATEGORIA);

-- CRIANDO TRIGGERS
SET TERM #;

CREATE OR ALTER TRIGGER TG_INSERT_IDCLIENTE FOR CLIENTE BEFORE INSERT POSITION 0
AS
BEGIN
	NEW.IDCLIENTE = GEN_ID(SEQ_CLIENTE, 1);
END#

CREATE TRIGGER TG_INSERT_IDTELEFONE FOR TELEFONE BEFORE INSERT POSITION 0
AS
BEGIN
	NEW.IDTELEFONE = GEN_ID(SEQ_TELEFONE, 1);
END#

CREATE TRIGGER TG_INSERT_IDENDERECO FOR ENDERECO BEFORE INSERT POSITION 0
AS
BEGIN
	NEW.IDENDERECO = GEN_ID(SEQ_ENDERECO, 1);
END#

CREATE TRIGGER TG_INSERT_IDPRODUTO FOR PRODUTO BEFORE INSERT POSITION 0
AS
BEGIN
	NEW.IDPRODUTO = GEN_ID(SEQ_PRODUTO, 1);
END#

CREATE TRIGGER TG_INSERT_IDPEDIDO FOR PEDIDO BEFORE INSERT POSITION 0
AS
BEGIN
	NEW.IDPEDIDO = GEN_ID(SEQ_PEDIDO, 1);
END#

CREATE TRIGGER TG_INSERT_IDPAGAMENTO FOR PAGAMENTO BEFORE INSERT POSITION 0
AS
BEGIN
	NEW.IDPAGAMENTO = GEN_ID(SEQ_PAGAMENTO, 1);
END#

CREATE TRIGGER TG_INSERT_IDCATEGORIA FOR CATEGORIA BEFORE INSERT POSITION 0
AS
BEGIN
	NEW.IDCATEGORIA = GEN_ID(SEQ_CATEGORIA, 1);
END#

CREATE TRIGGER TG_INSERT_IDITEM_PEDIDO FOR ITEM_PEDIDO BEFORE INSERT POSITION 0
AS
BEGIN
	NEW.IDITEM_PEDIDO = GEN_ID(SEQ_ITEM_PEDIDO, 1);
END#

SET TERM ;#

-- INSERTS

-- INSERIR UM CLIENTE
INSERT INTO CLIENTE (IDCLIENTE, NOME, CPF, SEXO, DT_NASCIMENTO) VALUES (NULL, 'Laine Evangelista', '12345678900', 'F', '1990-01-01');
INSERT INTO CLIENTE (IDCLIENTE, NOME, CPF, SEXO, DT_NASCIMENTO) VALUES (NULL, 'Emanuel Marcos', '019.876.543.21', 'M', '2003-04-18');
INSERT INTO CLIENTE (IDCLIENTE, NOME, CPF, SEXO, DT_NASCIMENTO) VALUES (NULL, 'Carlos Alberto', '000.111.222-33', 'M', '1984-08-07');

-- INSERIR UM TELEFONE PARA O CLIENTE
INSERT INTO TELEFONE (IDTELEFONE, IDCLIENTE, TELEFONE) VALUES (NULL, 3, '(11) 1234-5678');
INSERT INTO TELEFONE (IDTELEFONE, IDCLIENTE, TELEFONE) VALUES (NULL, 3, '(22) 9874-3210');
INSERT INTO TELEFONE (IDTELEFONE, IDCLIENTE, TELEFONE) VALUES (NULL, 4, '+55 44 9 9999-9999');
INSERT INTO TELEFONE (IDTELEFONE, IDCLIENTE, TELEFONE) VALUES (NULL, 4, '+55 44 8 8888-8888');
INSERT INTO TELEFONE (IDTELEFONE, IDCLIENTE, TELEFONE) VALUES (NULL, 4, '+55 44 7 7777-7777');

-- INSERIR UM ENDEREÇO PARA O CLIENTE
INSERT INTO ENDERECO (IDENDERECO, IDCLIENTE, ESTADO, RUA, NUMERO, BAIRRO, CIDADE, CEP) VALUES (NULL, 3, 'SP', 'Rua Principal', '123', 'Centro', 'São Paulo', '12345-678');
INSERT INTO ENDERECO (IDENDERECO, IDCLIENTE, ESTADO, RUA, NUMERO, BAIRRO, CIDADE, CEP) VALUES (NULL, 4, 'PR', 'Rua Secundaria', '654', 'Dom Pedro II', 'Rio de Janeiro', '987-65432');
INSERT INTO ENDERECO (IDENDERECO, IDCLIENTE, ESTADO, RUA, NUMERO, BAIRRO, CIDADE, CEP) VALUES (NULL, 4, 'PR', 'Rua Terceiro', '218-B', 'Castro III', 'Paraná', '654-78921');

-- INSERIR UMA CATEGORIA
INSERT INTO CATEGORIA (IDCATEGORIA, NOME) VALUES (NULL, 'Roupas');
INSERT INTO CATEGORIA (IDCATEGORIA, NOME) VALUES (NULL, 'Calçados');
INSERT INTO CATEGORIA (IDCATEGORIA, NOME) VALUES (NULL, 'Acessórios');

-- INSERIR UM PRODUTO
INSERT INTO PRODUTO (IDPRODUTO, IDCATEGORIA, NOME, DESCRICAO, PRECO, QUANTIDADE) VALUES (NULL, 4, 'Camiseta',	 	'Camiseta de algodão', 		49.99, 10);
INSERT INTO PRODUTO (IDPRODUTO, IDCATEGORIA, NOME, DESCRICAO, PRECO, QUANTIDADE) VALUES (NULL, 4, 'Calça', 			'Calça Jeans', 				79.99, 4 );
INSERT INTO PRODUTO (IDPRODUTO, IDCATEGORIA, NOME, DESCRICAO, PRECO, QUANTIDADE) VALUES (NULL, 4, 'Blusa', 			'Blusa de Manga Longa', 	39.99, 6 );
INSERT INTO PRODUTO (IDPRODUTO, IDCATEGORIA, NOME, DESCRICAO, PRECO, QUANTIDADE) VALUES (NULL, 4, 'Shorts', 		'Shorts Jeans', 			29.99, 8 );
INSERT INTO PRODUTO (IDPRODUTO, IDCATEGORIA, NOME, DESCRICAO, PRECO, QUANTIDADE) VALUES (NULL, 4, 'Vestido', 		'Vestido Estampado', 		59.99, 3 );
INSERT INTO PRODUTO (IDPRODUTO, IDCATEGORIA, NOME, DESCRICAO, PRECO, QUANTIDADE) VALUES (NULL, 4, 'Camisa', 		'Camisa Social', 			69.99, 5 );
INSERT INTO PRODUTO (IDPRODUTO, IDCATEGORIA, NOME, DESCRICAO, PRECO, QUANTIDADE) VALUES (NULL, 4, 'Saia', 			'Saia Plissada', 			49.99, 2 );
INSERT INTO PRODUTO (IDPRODUTO, IDCATEGORIA, NOME, DESCRICAO, PRECO, QUANTIDADE) VALUES (NULL, 5, 'Sapato', 		'Sapato de Salto Alto',		89.99, 7 );
INSERT INTO PRODUTO (IDPRODUTO, IDCATEGORIA, NOME, DESCRICAO, PRECO, QUANTIDADE) VALUES (NULL, 6, 'Bolsa',		 	'Bolsa de Couro', 			99.99, 10);
INSERT INTO PRODUTO (IDPRODUTO, IDCATEGORIA, NOME, DESCRICAO, PRECO, QUANTIDADE) VALUES (NULL, 6, 'Óculos de Sol', 	'Óculos de Sol Fashion', 	59.99, 4 );

-- INSERIR UM PEDIDO PARA O CLIENTE
INSERT INTO PEDIDO (IDPEDIDO, IDCLIENTE) VALUES (NULL, 3);
INSERT INTO PEDIDO (IDPEDIDO, IDCLIENTE) VALUES (NULL, 4);
INSERT INTO PEDIDO (IDPEDIDO, IDCLIENTE) VALUES (NULL, 4);
INSERT INTO PEDIDO (IDPEDIDO, IDCLIENTE) VALUES (NULL, 3);
INSERT INTO PEDIDO (IDPEDIDO, IDCLIENTE) VALUES (NULL, 3);
INSERT INTO PEDIDO (IDPEDIDO, IDCLIENTE) VALUES (NULL, 4);
INSERT INTO PEDIDO (IDPEDIDO, IDCLIENTE) VALUES (NULL, 3);

-- INSERIR OS ITEM NO CARRINHO
INSERT INTO ITEM_PEDIDO (IDITEM_PEDIDO, IDPEDIDO, IDPRODUTO, QUANTIDADE, PRECO_UNITARIO, DESCONTOS) VALUES (NULL, 8 , 22, 2, 49.99, 0);
INSERT INTO ITEM_PEDIDO (IDITEM_PEDIDO, IDPEDIDO, IDPRODUTO, QUANTIDADE, PRECO_UNITARIO, DESCONTOS) VALUES (NULL, 9 , 22, 2, 49.99, 0);
INSERT INTO ITEM_PEDIDO (IDITEM_PEDIDO, IDPEDIDO, IDPRODUTO, QUANTIDADE, PRECO_UNITARIO, DESCONTOS) VALUES (NULL, 10, 22, 1, 39.99, 0);
INSERT INTO ITEM_PEDIDO (IDITEM_PEDIDO, IDPEDIDO, IDPRODUTO, QUANTIDADE, PRECO_UNITARIO, DESCONTOS) VALUES (NULL, 11, 22, 3, 29.99, 0);
INSERT INTO ITEM_PEDIDO (IDITEM_PEDIDO, IDPEDIDO, IDPRODUTO, QUANTIDADE, PRECO_UNITARIO, DESCONTOS) VALUES (NULL, 12, 22, 1, 79.99, 0);
INSERT INTO ITEM_PEDIDO (IDITEM_PEDIDO, IDPEDIDO, IDPRODUTO, QUANTIDADE, PRECO_UNITARIO, DESCONTOS) VALUES (NULL, 13, 22, 3, 49.99, 0);
INSERT INTO ITEM_PEDIDO (IDITEM_PEDIDO, IDPEDIDO, IDPRODUTO, QUANTIDADE, PRECO_UNITARIO, DESCONTOS) VALUES (NULL, 14, 22, 2, 79.99, 0);


-- INSERIR UM PAGAMENTO
INSERT INTO PAGAMENTO (IDPAGAMENTO, IDPEDIDO, TIPO) VALUES (NULL, 7, 'CC');
INSERT INTO PAGAMENTO (IDPAGAMENTO, IDPEDIDO, TIPO) VALUES (NULL, 1, 'CC');
INSERT INTO PAGAMENTO (IDPAGAMENTO, IDPEDIDO, TIPO) VALUES (NULL, 2, 'TB');
INSERT INTO PAGAMENTO (IDPAGAMENTO, IDPEDIDO, TIPO) VALUES (NULL, 3, 'CC');
INSERT INTO PAGAMENTO (IDPAGAMENTO, IDPEDIDO, TIPO) VALUES (NULL, 4, 'DH');
INSERT INTO PAGAMENTO (IDPAGAMENTO, IDPEDIDO, TIPO) VALUES (NULL, 5, 'CC');
INSERT INTO PAGAMENTO (IDPAGAMENTO, IDPEDIDO, TIPO) VALUES (NULL, 6, 'CC');

-- LIMPAR GENERATOR
SET GENERATOR SEQ_CATEGORIA TO 0;
SET GENERATOR SEQ_CLIENTE TO 0;
SET GENERATOR SEQ_ENDERECO TO 0;
SET GENERATOR SEQ_ITEM_PEDIDO TO 0;
SET GENERATOR SEQ_PAGAMENTO TO 0;
SET GENERATOR SEQ_PEDIDO TO 0;
SET GENERATOR SEQ_PRODUTO TO 0;
SET GENERATOR SEQ_TELEFONE TO 0;

-- VIEWS
CREATE OR ALTER VIEW V_CLIENTES AS
	SELECT 
		IDCLIENTE AS ID,
		NOME,
		CPF,
		SEXO,
		EXTRACT(DAY FROM DT_NASCIMENTO) || '/' ||
		EXTRACT(MONTH FROM DT_NASCIMENTO) || '/' ||
		EXTRACT(YEAR FROM DT_NASCIMENTO) AS DATA_DE_NASCIMENTO
FROM CLIENTE;

CREATE OR ALTER VIEW V_PRODUTOS AS
	SELECT
		IDPRODUTO AS ID_PROD,
		IDCATEGORIA AS ID_CAT,
		NOME,
		PRECO,
		QUANTIDADE
FROM PRODUTO;

CREATE OR ALTER VIEW V_PEDIDOS AS
	SELECT
		IDPEDIDO AS ID_PED,
		IDCLIENTE AS ID_CLI
FROM PEDIDO;

CREATE OR ALTER VIEW V_PAGAMENTOS AS
	SELECT
		IDPAGAMENTO AS ID_PAG,
		IDPEDIDO AS ID_PED,
		TIPO
FROM PAGAMENTO;

-- PROCEDURES
SET TERM #;

CREATE OR ALTER PROCEDURE P_CLIENTE (
  NOME 				VARCHAR(30),
  CPF 				VARCHAR(14),
  SEXO 				CHAR(1),
  DT_NASCIMENTO 	DATE
)

RETURNS (
  MENSAGEM VARCHAR(10)
)

AS
BEGIN
  INSERT INTO CLIENTE (NOME, CPF, SEXO, DT_NASCIMENTO) VALUES (:NOME, :CPF, :SEXO, :DT_NASCIMENTO);
  MENSAGEM = 'Cadastrado';
  SUSPEND;
END#

SET TERM ;#