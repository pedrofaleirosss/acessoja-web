
-- GLOBAL SOLUTION 2026.2
-- ACESSOJA - SCRIPT DML

-- USUARIOS
INSERT INTO USUARIO VALUES
(1, 'Renata Costa', 'renata@acessoja.com', 'hash_exemplo_01', 'ADMIN', DATE '2026-11-01', 'S');

INSERT INTO USUARIO VALUES
(2, 'Mariana Oliveira', 'mariana@email.com', 'hash_exemplo_02', 'CIDADAO', DATE '2026-11-01', 'S');

INSERT INTO USUARIO VALUES
(3, 'Lucas Santos', 'lucas@email.com', 'hash_exemplo_03', 'CIDADAO', DATE '2026-11-02', 'S');

INSERT INTO USUARIO VALUES
(4, 'Antonio Ferreira', 'antonio@email.com', 'hash_exemplo_04', 'CIDADAO', DATE '2026-11-02', 'S');

INSERT INTO USUARIO VALUES
(5, 'Joana Silva', 'joana@email.com', 'hash_exemplo_05', 'CIDADAO', DATE '2026-11-03', 'S');


-- CIDADES
INSERT INTO CIDADE VALUES (1, 'Atibaia', 'SP');
INSERT INTO CIDADE VALUES (2, 'Sao Paulo', 'SP');
INSERT INTO CIDADE VALUES (3, 'Campinas', 'SP');
INSERT INTO CIDADE VALUES (4, 'Jundiai', 'SP');
INSERT INTO CIDADE VALUES (5, 'Santos', 'SP');


-- BAIRROS
INSERT INTO BAIRRO VALUES (1, 'Centro', 1);
INSERT INTO BAIRRO VALUES (2, 'Bela Vista', 2);
INSERT INTO BAIRRO VALUES (3, 'Cambui', 3);
INSERT INTO BAIRRO VALUES (4, 'Anhangabau', 4);
INSERT INTO BAIRRO VALUES (5, 'Gonzaga', 5);


-- REGISTROS DE ESTABELECIMENTOS
INSERT INTO REGISTRO VALUES
(1, 2, 1, 1, 'ESTABELECIMENTO', 'Farmacia Central',
'Farmacia com entrada acessivel', 'Rua Central, 100',
DATE '2026-11-04', 'APROVADO', DATE '2026-11-05');

INSERT INTO REGISTRO VALUES
(2, 3, 2, 1, 'ESTABELECIMENTO', 'Biblioteca Municipal',
'Biblioteca com elevador', 'Rua das Flores, 200',
DATE '2026-11-04', 'APROVADO', DATE '2026-11-05');

INSERT INTO REGISTRO VALUES
(3, 4, 3, 1, 'ESTABELECIMENTO', 'Mercado Popular',
'Mercado com rampa de acesso', 'Av. Brasil, 300',
DATE '2026-11-05', 'APROVADO', DATE '2026-11-06');

INSERT INTO REGISTRO VALUES
(4, 5, 4, 1, 'ESTABELECIMENTO', 'Clinica Vida',
'Clinica com banheiro adaptado', 'Rua Sao Jose, 40',
DATE '2026-11-05', 'APROVADO', DATE '2026-11-06');

INSERT INTO REGISTRO VALUES
(5, 2, 5, 1, 'ESTABELECIMENTO', 'Cafe da Orla',
'Cafe com entrada acessivel', 'Av. da Praia, 50',
DATE '2026-11-06', 'APROVADO', DATE '2026-11-07');


-- REGISTROS DE AREAS ACESSIVEIS
INSERT INTO REGISTRO VALUES
(6, 3, 1, 1, 'AREA', 'Praca da Matriz',
'Praca com caminhos adaptados', 'Praca Central',
DATE '2026-11-06', 'APROVADO', DATE '2026-11-07');

INSERT INTO REGISTRO VALUES
(7, 4, 2, 1, 'AREA', 'Praca do Bairro',
'Praca com rampas de acesso', 'Rua Principal, 20',
DATE '2026-11-06', 'APROVADO', DATE '2026-11-07');

INSERT INTO REGISTRO VALUES
(8, 5, 3, 1, 'AREA', 'Parque Comunitario',
'Parque com caminhos acessiveis', 'Av. das Arvores, 10',
DATE '2026-11-07', 'APROVADO', DATE '2026-11-08');

INSERT INTO REGISTRO VALUES
(9, 2, 4, 1, 'AREA', 'Calcada Adaptada',
'Calcada com piso regular', 'Rua da Escola, 80',
DATE '2026-11-07', 'APROVADO', DATE '2026-11-08');

INSERT INTO REGISTRO VALUES
(10, 3, 5, NULL, 'AREA', 'Praca da Orla',
'Praca com boa acessibilidade', 'Av. Beira Mar, 100',
DATE '2026-11-08', 'PENDENTE', NULL);


-- REGISTROS DE BARREIRAS
INSERT INTO REGISTRO VALUES
(11, 4, 1, 1, 'BARREIRA', 'Calcada quebrada',
'Buraco dificulta a passagem', 'Rua das Palmeiras, 15',
DATE '2026-11-08', 'APROVADO', DATE '2026-11-09');

INSERT INTO REGISTRO VALUES
(12, 5, 2, 1, 'BARREIRA', 'Rampa bloqueada',
'Veiculo estacionado sobre a rampa', 'Rua Augusta, 90',
DATE '2026-11-08', 'APROVADO', DATE '2026-11-09');

INSERT INTO REGISTRO VALUES
(13, 2, 3, 1, 'BARREIRA', 'Degrau na entrada',
'Entrada de passagem sem rampa', 'Rua do Comercio, 55',
DATE '2026-11-09', 'APROVADO', DATE '2026-11-10');

INSERT INTO REGISTRO VALUES
(14, 3, 4, 1, 'BARREIRA', 'Piso irregular',
'Piso danificado na calcada', 'Av. Central, 70',
DATE '2026-11-09', 'APROVADO', DATE '2026-11-10');

INSERT INTO REGISTRO VALUES
(15, 4, 5, 1, 'BARREIRA', 'Travessia sem rampa',
'Travessia com desnivel', 'Rua da Praia, 45',
DATE '2026-11-10', 'APROVADO', DATE '2026-11-11');


-- ESTABELECIMENTOS
INSERT INTO ESTABELECIMENTO VALUES (1, 'Farmacia');
INSERT INTO ESTABELECIMENTO VALUES (2, 'Biblioteca');
INSERT INTO ESTABELECIMENTO VALUES (3, 'Supermercado');
INSERT INTO ESTABELECIMENTO VALUES (4, 'Clinica');
INSERT INTO ESTABELECIMENTO VALUES (5, 'Cafeteria');


-- AREAS ACESSIVEIS
INSERT INTO AREA_ACESSIVEL VALUES
(6, 'Praca', 'Possui rampas e caminhos largos');

INSERT INTO AREA_ACESSIVEL VALUES
(7, 'Praca', 'Possui entrada sem degraus');

INSERT INTO AREA_ACESSIVEL VALUES
(8, 'Parque', 'Possui caminhos pavimentados');

INSERT INTO AREA_ACESSIVEL VALUES
(9, 'Calcada', 'Possui piso regular e rampa');

INSERT INTO AREA_ACESSIVEL VALUES
(10, 'Praca', 'Possui areas de circulacao acessiveis');


-- BARREIRAS
INSERT INTO BARREIRA VALUES (11, 'Buraco', 'ATIVA');
INSERT INTO BARREIRA VALUES (12, 'Rampa bloqueada', 'RESOLUCAO_INFORMADA');
INSERT INTO BARREIRA VALUES (13, 'Falta de rampa', 'RESOLVIDA');
INSERT INTO BARREIRA VALUES (14, 'Piso irregular', 'ATIVA');
INSERT INTO BARREIRA VALUES (15, 'Desnivel', 'RESOLUCAO_INFORMADA');


-- RECURSOS DE ACESSIBILIDADE
INSERT INTO RECURSO_ACESSIBILIDADE VALUES
(1, 'Rampa de acesso', 'Rampa para entrada acessivel');

INSERT INTO RECURSO_ACESSIBILIDADE VALUES
(2, 'Elevador', 'Elevador para diferentes andares');

INSERT INTO RECURSO_ACESSIBILIDADE VALUES
(3, 'Banheiro adaptado', 'Banheiro com acessibilidade');

INSERT INTO RECURSO_ACESSIBILIDADE VALUES
(4, 'Entrada sem degraus', 'Entrada nivelada');

INSERT INTO RECURSO_ACESSIBILIDADE VALUES
(5, 'Piso tatil', 'Sinalizacao no piso');


-- ESTABELECIMENTO_RECURSO
INSERT INTO ESTABELECIMENTO_RECURSO VALUES (1, 1);
INSERT INTO ESTABELECIMENTO_RECURSO VALUES (1, 4);
INSERT INTO ESTABELECIMENTO_RECURSO VALUES (2, 2);
INSERT INTO ESTABELECIMENTO_RECURSO VALUES (3, 1);
INSERT INTO ESTABELECIMENTO_RECURSO VALUES (4, 3);


-- AVALIACOES
INSERT INTO AVALIACAO VALUES
(1, 3, 1, 5, 'Boa acessibilidade', DATE '2026-11-10');

INSERT INTO AVALIACAO VALUES
(2, 2, 2, 4, 'Local bem adaptado', DATE '2026-11-10');

INSERT INTO AVALIACAO VALUES
(3, 5, 3, 4, 'Possui rampa na entrada', DATE '2026-11-11');

INSERT INTO AVALIACAO VALUES
(4, 4, 4, 5, 'Excelente estrutura', DATE '2026-11-11');

INSERT INTO AVALIACAO VALUES
(5, 3, 5, 3, 'Acesso poderia melhorar', DATE '2026-11-12');


-- VALIDACOES
INSERT INTO VALIDACAO VALUES
(1, 3, 1, 'CONFIRMA', 'Local acessivel', DATE '2026-11-10');

INSERT INTO VALIDACAO VALUES
(2, 4, 2, 'CONFIRMA', 'Informacao correta', DATE '2026-11-10');

INSERT INTO VALIDACAO VALUES
(3, 5, 6, 'CONFIRMA', 'Praca acessivel', DATE '2026-11-11');

INSERT INTO VALIDACAO VALUES
(4, 2, 11, 'CONTESTA', 'Situacao precisa de revisao', DATE '2026-11-11');

INSERT INTO VALIDACAO VALUES
(5, 3, 12, 'CONFIRMA', 'Rampa estava bloqueada', DATE '2026-11-12');


-- RELATOS DE RESOLUCAO
INSERT INTO RELATO_RESOLUCAO VALUES
(1, 11, 2, 1, 'Buraco ainda existe',
DATE '2026-11-11', 'REJEITADO', DATE '2026-11-12');

INSERT INTO RELATO_RESOLUCAO VALUES
(2, 12, 3, NULL, 'Rampa foi liberada',
DATE '2026-11-11', 'PENDENTE', NULL);

INSERT INTO RELATO_RESOLUCAO VALUES
(3, 13, 4, 1, 'Rampa instalada no local',
DATE '2026-11-12', 'APROVADO', DATE '2026-11-13');

INSERT INTO RELATO_RESOLUCAO VALUES
(4, 14, 2, 1, 'Piso continua danificado',
DATE '2026-11-12', 'REJEITADO', DATE '2026-11-13');

INSERT INTO RELATO_RESOLUCAO VALUES
(5, 15, 5, NULL, 'Travessia recebeu melhorias',
DATE '2026-11-13', 'PENDENTE', NULL);

COMMIT;
