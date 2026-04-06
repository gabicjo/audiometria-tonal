# Audiometria Tonal

Aplicação web de audiometria tonal com foco em interface técnica, controle manual de resposta do usuário e emissão de tom puro no navegador.

O projeto foi construído para ser simples de executar (HTML/CSS/JS puro), mas com uma lógica interna clara para experimentos de limiar auditivo por frequência.

## Objetivo do projeto

Permitir um fluxo de teste auditivo manual onde:

- uma frequência é definida;
- um tom puro é emitido nessa frequência;
- o volume é ajustado com base na resposta do usuário ("Escutou" / "Não escutou");
- a frequência pode ser trocada sem perder consistência do estado do teste.

## Tecnologias utilizadas

- **HTML5** para estrutura da interface.
- **CSS3** para design system (tokens em `:root`, layout responsivo e componentes).
- **JavaScript (Vanilla)** para toda a lógica de áudio e interação.
- **Web Audio API** para síntese do tom senoidal.
- **Font Awesome (CDN)** para ícones de interação.
- **Google Fonts (CDN)** para tipografia.

## Como o sistema funciona por trás

### 1) Geração de áudio

A emissão de som é feita por Web Audio API:

1. Cria-se um `AudioContext`.
2. Cria-se um `OscillatorNode` no tipo `sine` (onda senoidal pura).
3. Cria-se um `GainNode` para controlar intensidade.
4. O oscilador é conectado ao ganho e ao destino (`audioCtx.destination`).
5. O volume percentual (0 a 100) é normalizado para ganho (0.0 a 1.0).
6. A frequência é limitada para faixa audível segura (20 Hz a 20000 Hz).

Isso permite gerar tom puro dinamicamente no navegador, sem arquivos de áudio externos.

### 2) Controle de emissão (iniciar/parar)

O sistema encapsula o áudio ativo em um objeto de sessão com operações:

- **parar**: interrompe o oscilador e fecha o `AudioContext`.
- **atualizarVolume**: altera o ganho em tempo real durante emissão.

Esse padrão evita múltiplos tons simultâneos e mantém controle explícito de ciclo de vida do áudio.

### 3) Monitoramento contínuo de volume

Enquanto o tom está ativo, há um monitor curto (intervalo periódico) que lê o valor atual da UI e sincroniza o ganho do áudio.

Resultado prático:

- o volume visual e o volume efetivo permanecem alinhados;
- ajustes de volume têm resposta imediata.

### 4) Algoritmo de ajuste por resposta do usuário

O fluxo "Escutou / Não escutou" mantém dois marcadores:

- último volume em que o usuário **escutou**;
- último volume em que o usuário **não escutou**.

Com esses dois limites, o próximo volume é recalculado no meio do intervalo (refinamento progressivo, estilo busca binária), reduzindo o passo de ajuste conforme aproximação do limiar.

Sem os dois limites definidos, o volume sobe ou desce por passo adaptativo inicial.

### 5) Troca de frequência

A frequência é escolhida por modal com seleção única. Ao confirmar:

- o valor da frequência exibida é atualizado;
- o volume é reiniciado;
- o estado adaptativo de resposta é zerado;
- qualquer emissão em andamento é interrompida.

Isso garante consistência entre frequências diferentes e evita carregar estado de um teste anterior.

### 6) Entrada desktop e mobile

O sistema suporta duas formas de acionamento de emissão:

- **Desktop**: pressão/soltura da tecla configurada (modo "push-to-listen");
- **Mobile**: botão de toque e segurar com ícone para simular o mesmo comportamento.

Ambos usam o mesmo núcleo de emissão/parada para manter comportamento equivalente entre dispositivos.

## Arquitetura de arquivos

```text
.
├── index.html
└── source
    ├── js
    │   └── app.js
    └── styles
        ├── global.css
        └── styles.css
```

- `index.html`: estrutura da interface e pontos de montagem de interação.
- `source/js/app.js`: motor da aplicação (áudio, eventos, ajuste de volume e troca de frequência).
- `source/styles/global.css`: reset/base global.
- `source/styles/styles.css`: design system e componentes visuais.

## Funcionalidades atuais

- Emissão de tom puro com frequência dinâmica.
- Atualização de volume em tempo real durante emissão.
- Controle adaptativo por respostas "Escutou" e "Não escutou".
- Seletor de frequência com opções pré-definidas.
- Reset de estado ao trocar frequência.
- Fluxo de uso compatível com desktop e mobile.
- Interface responsiva com tema escuro e destaque neon.

## Como executar localmente

Como o projeto usa APIs do navegador, execute via servidor local (evite abrir com `file://`).

### Opção 1: Python

```bash
python3 -m http.server 8000
```

Abra:

- [http://localhost:8000](http://localhost:8000)

### Opção 2: Node (serve)

```bash
npx serve .
```

Abra a URL exibida no terminal.

## Como usar

1. Abra a aplicação no navegador.
2. Defina/visualize a frequência atual.
3. Inicie a emissão (teclado no desktop ou botão dedicado no mobile).
4. Use os botões de resposta para ajustar o volume.
5. Troque a frequência quando necessário.
6. Repita o processo para mapear limiares por faixa.

## Personalização rápida

Você pode alterar sem quebrar a arquitetura geral:

- **Paleta e tipografia**: tokens CSS em `source/styles/styles.css` (`:root`).
- **Faixas de frequência**: lista configurada no JavaScript.
- **Faixa de segurança de Hz**: limites de frequência no motor de emissão.
- **Regra de progressão do volume**: função de ajuste adaptativo.

## Boas práticas para evolução

- Manter separação entre camada visual (CSS) e lógica de domínio (JS).
- Centralizar constantes (frequências, passo inicial, limites) para facilitar calibração.
- Evitar dependência de estado implícito em DOM; preferir funções de leitura/escrita claras.
- Adicionar testes de fluxo para regras de ajuste de volume e troca de frequência.

## Observações importantes

- Em alguns navegadores/dispositivos, autoplay de áudio é bloqueado até interação explícita do usuário (comportamento esperado de segurança).
- Resultado de audiometria depende do hardware de saída, ambiente e percepção individual; este projeto é uma base técnica de teste, não substitui avaliação clínica profissional.
