
-- GLOBAL SOLUTION 2026.2
-- ACESSOJA - SCRIPT DQL


-- CONSULTA 1: INNER JOIN COM DUAS TABELAS
-- Mostra os registros e seus respectivos bairros.

SELECT
    r.titulo,
    r.tipo_registro,
    b.nome AS bairro
FROM REGISTRO r
INNER JOIN BAIRRO b
    ON r.id_bairro = b.id_bairro;


-- CONSULTA 2: INNER JOIN COM GROUP BY
-- Mostra a quantidade de registros por bairro.

SELECT
    b.nome AS bairro,
    COUNT(r.id_registro) AS total_registros
FROM BAIRRO b
INNER JOIN REGISTRO r
    ON b.id_bairro = r.id_bairro
GROUP BY
    b.id_bairro, b.nome;


-- CONSULTA 3: LEFT OUTER JOIN COM WHERE E ORDER BY
-- Mostra os usuarios ativos e suas avaliacoes,
-- incluindo aqueles que ainda nao avaliaram.

SELECT
    u.nome AS usuario,
    a.nota,
    a.comentario
FROM USUARIO u
LEFT OUTER JOIN AVALIACAO a
    ON u.id_usuario = a.id_usuario
WHERE u.ativo = 'S'
ORDER BY u.nome;
