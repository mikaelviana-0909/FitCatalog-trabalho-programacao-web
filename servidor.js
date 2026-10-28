//Importando express.
const express = require('express');

//Instanciando.
const app = express();

//Permite que o servidor entenda dados JSON.
app.use(express.json());

//Tornando a pasta publico acessivel.
app.use(express.static('publico'));

//Registros iniciais "banco de dados".
let exercicios = [
    { id: 1, nome: 'Supino Reto', grupo: 'Peito', carga: 355}, //Julius Maddox.
    { id: 2, nome: 'Agachamento Livre', grupo: 'Pernas', carga: 497}, //Media de Ray Williams, Vlad Alhazov e Jesus Olivares.
    { id: 3, nome: 'Puxada Frontal', grupo: 'Costas', carga: 187}, //Sem nomes.
    { id: 4, nome: 'Rosca Direta', grupo: 'Braços', carga: 114} //Sem nomes.
];

//Endpoint GET para colecao.
app.get('/api/exercicios', (req, res) => {
    //Extraindo valor de grupo.
    const grupo = req.query.grupo;

    //Percorrendo a colecao.
    if (grupo) {
        const filtrados = exercicios.filter(e => e.grupo === grupo);
        res.status(200).json(filtrados);
    } else {
        res.json(exercicios);
    }
});

//Endpoint GET com Router Parameter.
app.get('/api/exercicios/:id', (req, res) => {
    //Converte para numero.
    const id = Number(req.params.id);

    //Verifica se a conversao funcionou.
    if (isNaN(id)) {
        return res.status(404).json({ erro: "O recurso pedido nao existe."});
    }

    const exercicio = exercicios.find(e => e.id === id);

    if (!exercicio) {
        return res.status(404).json({ erro: "Exercicio nao encontrado no sistema."});
    }

    res.json(exercicio);
});

app.post('/api/exercicios', (req, res) => {
    const { nome, grupo, carga} = req.body;

    //Verificacao do nome.
    if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
        return res.status(400).json({
            erro: "O nome do ecxercicio e obrigatorio e deve ter pelo menos 3 caracteres."
        });
    }

    //Verificacao do grupo.
    if (!grupo || typeof grupo !== 'string') {
        return res.status(400).json({
            erro: "O grupo muscular e obrigatorio."
        });
    }

    //Verificacao da carga.
    const cargaNum = Number(carga);

    if (isNaN(cargaNum) || cargaNum < 1 || cargaNum > 600) {
        return res.status(400).json({
            erro: "A carga deve ser um numero valido entre 1kg e 600kg."
        })
    }

    //cria um novo registro
    let maiorId = 0;

    for (let i = 0; i < exercicios.length; i++) {
        if (exercicios[i].id > maiorId) {
            maiorId = exercicios[i].id;
        }
    }

    const novoId = maiorId + 1;

    const novoExercicio = {
        id: novoId,
        nome: nome.trim(),
        grupo: grupo.trim(),
        carga: cargaNum
    };

    exercicios.push(novoExercicio);
    res.status(201).json(novoExercicio);
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000...');
});