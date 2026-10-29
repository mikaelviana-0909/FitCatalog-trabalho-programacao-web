// =====================================================================
//  bancada.js — o nosso cliente HTTP de teste
//
//  Faz uma requisição ao servidor e mostra a RESPOSTA INTEIRA:
//  a linha de status, todos os cabeçalhos e o corpo.
//
//  Uso:
//    node bancada.js GET  /
//    node bancada.js GET  /api/recados
//    node bancada.js POST /api/recados autor=Ana texto="Agora vai."
//    node bancada.js POST /api/recados autor= texto=
//
//  Os pares chave=valor viram um objeto JSON, que a bancada mostra antes
//  de enviar. Valor entre aspas DUPLAS quando tiver espaço — aspas duplas
//  funcionam igual no macOS, no Linux e no Windows.
//
//  Valor que parece número vira número (nota=8.6 -> 8.6, e não "8.6").
// =====================================================================

const [, , metodo = 'GET', caminho = '/', ...partes] = process.argv;

function montaCorpo() {
  if (partes.length === 0) return undefined;

  // quem preferir pode passar o JSON inteiro, de uma vez
  if (partes[0].trim().startsWith('{')) return partes.join(' ');

  const dados = {};
  for (const parte of partes) {
    const corte = parte.indexOf('=');
    if (corte === -1) continue;

    const chave = parte.slice(0, corte);
    const valor = parte.slice(corte + 1);
    dados[chave] = /^-?\d+(\.\d+)?$/.test(valor) ? Number(valor) : valor;
  }
  return JSON.stringify(dados);
}

async function main() {
  const corpo = montaCorpo();

  console.log(`REQUISIÇÃO   ${metodo} ${caminho}`);
  if (corpo) console.log(`             corpo: ${corpo}`);

  let resposta;
  try {
    resposta = await fetch(`http://localhost:3000${caminho}`, {
      method: metodo,
      headers: corpo ? { 'Content-Type': 'application/json' } : {},
      body: corpo,
    });
  } catch (erro) {
    // duas falhas bem diferentes, que merecem recados diferentes
    if (erro.cause && erro.cause.code === 'ECONNREFUSED') {
      console.log('\nO servidor não respondeu — ele está no ar?');
      console.log('Em OUTRO terminal, dentro da pasta do projeto: node servidor.js');
    } else {
      console.log(`\nA requisição nem chegou a ser enviada: ${erro.message}`);
      console.log('Confira o comando: o método e o caminho são DOIS argumentos,');
      console.log('separados por espaço.  Exemplo:  node bancada.js GET /api/recados');
    }
    return;
  }

  console.log(`\nRESPOSTA     ${resposta.status} ${resposta.statusText}`);
  for (const [nome, valor] of resposta.headers) {
    console.log(`             ${nome}: ${valor}`);
  }

  console.log('\nCORPO');
  console.log(await resposta.text());
}

main();
