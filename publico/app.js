// Pega os elementos do index.html pelos seus ids.
const lista = document.getElementById('listaExercicios');
const filtro = document.getElementById('filtroGrupo');
const formulario = document.getElementById('formExercicio');
const mensagemLista = document.getElementById('mensagemLista');
const mensagemCadastro = document.getElementById('mensagemCadastro');

// 1. Busca a lista no servidor e desenha na página (GET).
async function carregarExercicios() {
    // Se escolheu um grupo, manda na query string: /api/exercicios?grupo=Peito
    let url = '/api/exercicios';
    if (filtro.value) {
        url += `?grupo=${filtro.value}`;
    }

    // fetch faz o pedido ao servidor; await espera a resposta chegar.
    const resposta = await fetch(url);
    const exercicios = await resposta.json();   // JSON vira objeto JavaScript

    lista.replaceChildren();                    // limpa a lista antiga
    mensagemLista.textContent = '';

    // Lista vazia não é erro: o servidor responde 200 com [].
    if (exercicios.length === 0) {
        mensagemLista.textContent = 'Nenhum exercício encontrado.';
    }

    // Para cada exercício, cria um cartão na tela.
    exercicios.forEach(exercicio => {
        const card = document.createElement('article');
        card.className = 'card-exercicio';   // classe do estilo.css

        const nome = document.createElement('h3');
        nome.textContent = exercicio.nome;

        const grupo = document.createElement('p');
        grupo.textContent = `Grupo: ${exercicio.grupo}`;

        const carga = document.createElement('p');
        carga.textContent = `Carga: ${exercicio.carga} kg`;

        // Cada botão chama uma função passando o id do exercício.
        const botao = document.createElement('button');
        botao.textContent = 'Ver detalhes';
        botao.onclick = () => verDetalhes(exercicio.id);

        const remover = document.createElement('button');
        remover.textContent = 'Remover';
        remover.onclick = () => removerExercicio(exercicio.id);

        card.append(nome, grupo, carga, botao, remover);
        lista.appendChild(card);
    });
}

// 2. Pede um exercício só, pelo id: /api/exercicios/2 (GET).
async function verDetalhes(id) {
    const resposta = await fetch(`/api/exercicios/${id}`);
    const exercicio = await resposta.json();

    // 404: o servidor diz que esse id não existe.
    if (resposta.status === 404) {
        mensagemLista.textContent = exercicio.erro;
        return;
    }

    alert(`${exercicio.nome} | ${exercicio.grupo} | ${exercicio.carga} kg`);
}

// 3. Apaga um exercício: DELETE /api/exercicios/2
async function removerExercicio(id) {
    const resposta = await fetch(`/api/exercicios/${id}`, { method: 'DELETE' });

    // 204: apagou (a resposta vem sem corpo, por isso não tem .json()).
    if (resposta.status === 204) {
        carregarExercicios();   // recarrega a lista sem o item apagado
    } else {
        mensagemLista.textContent = 'Não foi possível remover o exercício.';
    }
}

// 4. Ao escolher outro grupo no select, busca de novo.
filtro.addEventListener('change', carregarExercicios);

// 5. Ao enviar o formulário, manda os dados para o servidor validar (POST).
formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();   // não deixa a página recarregar

    // Monta o objeto com o que foi digitado.
    const dados = {
        nome: document.getElementById('nome').value,
        grupo: document.getElementById('grupo').value,
        carga: Number(document.getElementById('carga').value)
    };

    // POST: envia os dados em JSON no corpo da requisição.
    const resposta = await fetch('/api/exercicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)   // objeto vira texto JSON
    });
    const resultado = await resposta.json();

    if (resposta.status === 400) {
        // O servidor recusou: mostra o motivo que ele mandou.
        mensagemCadastro.textContent = resultado.erro;
        mensagemCadastro.className = 'erro';
    } else {
        // 201: o servidor aceitou.
        mensagemCadastro.textContent = 'Exercício cadastrado com sucesso!';
        mensagemCadastro.className = 'sucesso';
        formulario.reset();       // limpa o formulário
        carregarExercicios();     // atualiza a lista com o novo item
    }
});

// Ao abrir a página, mostra a lista.
carregarExercicios();