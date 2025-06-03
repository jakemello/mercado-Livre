document.addEventListener('DOMContentLoaded', () => {
    let produtoEmEdicao = null

    function validarCPF(input) {
        const cpf = input.value.replace(/\D/g, '')
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            input.setCustomValidity('CPF deve ter 11 dígitos e não pode ser todos iguais.')
            return false
        }

        let sum = 0
        let remainder

        for (let i = 1; i <= 9; i++) {
            sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i)
        }
        remainder = (sum * 10) % 11

        if ((remainder == 10) || (remainder == 11)) {
            remainder = 0
        }
        if (remainder != parseInt(cpf.substring(9, 10))) {
            input.setCustomValidity('CPF inválido.')
            return false
        }

        sum = 0
        for (let i = 1; i <= 10; i++) {
            sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i)
        }
        remainder = (sum * 10) % 11

        if ((remainder == 10) || (remainder == 11)) {
            remainder = 0
        }
        if (remainder != parseInt(cpf.substring(10, 11))) {
            input.setCustomValidity('CPF inválido.')
            return false
        }
        input.setCustomValidity('')
        return true
    }

    function validarTelefone(input) {
        const telefone = input.value.replace(/\D/g, '')
        if (!/^\d{10,11}$/.test(telefone)) {
            input.setCustomValidity('Telefone deve ter 10 ou 11 dígitos (com DDD).')
            return false
        }
        input.setCustomValidity('')
        return true
    }

    function maskCPF(value) {
        value = value.replace(/\D/g, '')
        value = value.replace(/(\d{3})(\d)/, '$1.$2')
        value = value.replace(/(\d{3})(\d)/, '$1.$2')
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        return value
    }

    function maskPhone(value) {
        value = value.replace(/\D/g, '')
        if (value.length === 11) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
        } else if (value.length === 10) {
            value = value.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3')
        }
        return value
    }

    function maskAccountNumber(value) {
        value = value.replace(/\D/g, '')
        value = value.substring(0, 4)
        return value
    }

    const formularioConsumidor = document.getElementById('cadastro-consumidor').querySelector('form')
    const formularioVendedor = document.getElementById('cadastro-vendedor').querySelector('form')
    const formularioProdutos = document.getElementById('formulario-cadastro-produtos')
    const divListaProdutos = document.querySelector('.lista-de-produtos')
    const telaBemVindo = document.getElementById('tela-bem-vindo')
    const entradaFotoProduto = document.getElementById('foto-produto')
    const preVisualizacaoImagem = document.getElementById('visualizacao-imagem')
    const containerPreVisualizacao = document.getElementById('container-visualizacao-imagem')
    const botaoEnviarProduto = formularioProdutos.querySelector('button.botao-primario')

    const botoesNavegacao = document.querySelectorAll('.botao-navegacao')
    const secoesConteudo = document.querySelectorAll('#tela-bem-vindo, #cadastro-consumidor, #cadastro-vendedor, #cadastro-produtos-principal')
    const containerFormularios = document.querySelector('.container-formularios')
    const areaCadastro = document.querySelector('.area-cadastro')

    if (entradaFotoProduto && preVisualizacaoImagem && containerPreVisualizacao) {
        entradaFotoProduto.addEventListener('change', function() {
            const file = this.files[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = function(e) {
                    preVisualizacaoImagem.src = e.target.result
                    preVisualizacaoImagem.style.display = 'block'
                    containerPreVisualizacao.style.display = 'block'
                }
                reader.readAsDataURL(file)
            } else {
                preVisualizacaoImagem.src = ''
                preVisualizacaoImagem.style.display = 'none'
                containerPreVisualizacao.style.display = 'none'
            }
        })
    }

    function resetarFormularioProdutos() {
        formularioProdutos.reset()
        botaoEnviarProduto.textContent = 'Cadastrar Produto'
        produtoEmEdicao = null
        preVisualizacaoImagem.src = ''
        preVisualizacaoImagem.style.display = 'none'
        containerPreVisualizacao.style.display = 'none'
        document.querySelectorAll('.item-produto.produto-atualizado').forEach(el => {
            el.classList.remove('produto-atualizado')
        })
    }

    function processarProduto(form) {
        const entradaFoto = form.querySelector('#foto-produto')
        const nomeProduto = form.querySelector('#nome-produto').value
        const descricaoProduto = form.querySelector('#descricao-produto').value
        const precoProduto = parseFloat(form.querySelector('#preco-produto').value).toFixed(2)
        const prazoEntrega = form.querySelector('#prazo-entrega').value

        let imgUrl
        if (entradaFoto.files.length > 0) {
            imgUrl = URL.createObjectURL(entradaFoto.files[0])
        } else if (produtoEmEdicao && produtoEmEdicao.querySelector('img')) {
            imgUrl = produtoEmEdicao.querySelector('img').src
        } else {
            imgUrl = './ImagensProjeto/placeholder_produto.png'
        }

        if (produtoEmEdicao) {
            produtoEmEdicao.querySelector('img').src = imgUrl
            produtoEmEdicao.querySelector('h4').textContent = nomeProduto
            produtoEmEdicao.querySelector('.detalhes-do-produto p:nth-of-type(1)').textContent = `Descrição: ${descricaoProduto}.`
            produtoEmEdicao.querySelector('.detalhes-do-produto p:nth-of-type(2)').textContent = `Preço: R$ ${precoProduto.replace('.', ',')} À vista no pix | Prazo de Entrega: ${prazoEntrega} dias`
            produtoEmEdicao.classList.add('produto-atualizado')
            setTimeout(() => produtoEmEdicao.classList.remove('produto-atualizado'), 1000)
            alert(`Produto "${nomeProduto}" foi atualizado com sucesso!😊`)
        } else {
            const divProduto = document.createElement('div')
            divProduto.classList.add('item-produto')
            const idUnico = `disponivel-venda-${Date.now()}`
            divProduto.innerHTML = `
                <img src="${imgUrl}" alt="Imagem de ${nomeProduto}">
                <section class="detalhes-do-produto">
                    <h4>${nomeProduto}</h4>
                    <p>Descrição: ${descricaoProduto}.</p>
                    <p>Preço: R$ ${precoProduto.replace('.', ',')} À vista no pix | Prazo de Entrega: ${prazoEntrega} dias</p>
                </section>
                <section class="acoes-produto">
                    <button class="editar botao-editar">Alterar Produto</button>
                    <button class="deletar botao-excluir">Excluir</button>
                    <div class="controle-disponibilidade">
                        <label for="${idUnico}">Disponível para venda:</label>
                        <input type="checkbox" id="${idUnico}" name="${idUnico}" checked>
                    </div>
                </section>
            `
            divListaProdutos.prepend(divProduto)
            alert('Produto cadastrado com sucesso!😁')
        }
        resetarFormularioProdutos()
    }

    configurarValidacaoFormulario(formularioConsumidor)
    configurarValidacaoFormulario(formularioVendedor)
    configurarValidacaoFormulario(formularioProdutos)

    function configurarValidacaoFormulario(elementoFormulario) {
        const entradaCpf = elementoFormulario.querySelector('[id*="cpf-"]')
        const entradaTelefone = elementoFormulario.querySelector('[id*="telefone-"]')
        const entradaAgencia = elementoFormulario.querySelector('#agencia-vendedor')
        const entradaConta = elementoFormulario.querySelector('#conta-vendedor')

        if (entradaCpf) {
            entradaCpf.addEventListener('input', (event) => { event.target.value = maskCPF(event.target.value) })
        }
        if (entradaTelefone) {
            entradaTelefone.addEventListener('input', (event) => { event.target.value = maskPhone(event.target.value) })
        }
        if (entradaAgencia) {
            entradaAgencia.addEventListener('input', (event) => { event.target.value = maskAccountNumber(event.target.value) })
        }
        if (entradaConta) {
            entradaConta.addEventListener('input', (event) => { event.target.value = maskAccountNumber(event.target.value) })
        }

        if (entradaCpf) {
            entradaCpf.addEventListener('blur', () => validarCPF(entradaCpf))
        }
        if (entradaTelefone) {
            entradaTelefone.addEventListener('blur', () => validarTelefone(entradaTelefone))
        }

        elementoFormulario.addEventListener('submit', (event) => {
            event.preventDefault()
            let formularioValido = true

            if (elementoFormulario.id === 'formulario-cadastro-produtos') {
                const nomeProduto = elementoFormulario.querySelector('#nome-produto').value
                const descricaoProduto = elementoFormulario.querySelector('#descricao-produto').value
                const precoProduto = elementoFormulario.querySelector('#preco-produto').value
                const prazoEntrega = elementoFormulario.querySelector('#prazo-entrega').value

                if (!nomeProduto || !descricaoProduto || !precoProduto || !prazoEntrega) {
                    alert('Por favor, preencha todos os campos obrigatórios do produto.')
                    formularioValido = false
                }
                if (formularioValido) {
                    processarProduto(elementoFormulario)
                }
            } else {
                if (entradaCpf && !validarCPF(entradaCpf)) {
                    formularioValido = false
                }
                if (entradaTelefone && !validarTelefone(entradaTelefone)) {
                    formularioValido = false
                }

                if (formularioValido) {
                    alert('Seu cadastro foi realizado com sucesso!😁')
                    elementoFormulario.reset()
                } else {
                    alert('Por favor, corrija os campos destacados antes de prosseguir.')
                }
            }
        })
    }

    if (divListaProdutos) {
        divListaProdutos.addEventListener('click', (event) => {
            const alvo = event.target
            const elementoProduto = alvo.closest('.item-produto')

            if (alvo.classList.contains('editar')) {
                if (elementoProduto) {
                    produtoEmEdicao = elementoProduto
                    botaoEnviarProduto.textContent = 'Salvar Alterações'

                    const nome = elementoProduto.querySelector('h4').textContent
                    const descricao = elementoProduto.querySelector('.detalhes-do-produto p:nth-of-type(1)').textContent.replace('Descrição: ', '').replace(/\.$/, '')
                    const textoPreco = elementoProduto.querySelector('.detalhes-do-produto p:nth-of-type(2)').textContent
                    const precoMatch = textoPreco.match(/R\$ ([\d,.]+)/)
                    const preco = precoMatch ? precoMatch[1].replace('.', '').replace(',', '.') : '0.00'
                    const prazoMatch = textoPreco.match(/Prazo de Entrega: (\d+) dias/)
                    const prazo = prazoMatch ? prazoMatch[1] : '0'
                    const urlImagem = elementoProduto.querySelector('img').src

                    formularioProdutos.querySelector('#nome-produto').value = nome
                    formularioProdutos.querySelector('#descricao-produto').value = descricao
                    formularioProdutos.querySelector('#preco-produto').value = preco
                    formularioProdutos.querySelector('#prazo-entrega').value = prazo

                    preVisualizacaoImagem.src = urlImagem
                    preVisualizacaoImagem.style.display = 'block'
                    containerPreVisualizacao.style.display = 'block'

                    if (areaCadastro) {
                        areaCadastro.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                }
            }

            if (alvo.classList.contains('deletar')) {
                if (elementoProduto) {
                    const nomeProduto = elementoProduto.querySelector('h4').textContent
                    if (confirm(`Tem certeza que deseja excluir o produto: ${nomeProduto}?😬`)) {
                        elementoProduto.remove()
                        if (produtoEmEdicao === elementoProduto) {
                            resetarFormularioProdutos()
                        }
                        alert(`O produto "${nomeProduto}" foi excluído.🗑`)
                    }
                }
            }

            if (alvo.type === 'checkbox' && alvo.closest('.controle-disponibilidade')) {
                if (elementoProduto) {
                    const nomeProduto = elementoProduto.querySelector('h4').textContent
                    const estaDisponivel = alvo.checked
                    alert(`Produto "${nomeProduto}" agora está ${estaDisponivel ? 'disponível' : 'indisponível'} para venda.`)
                }
            }
        })
    }

    const botaoResetarProduto = formularioProdutos.querySelector('button.botao-secundario')
    if (botaoResetarProduto) {
        botaoResetarProduto.addEventListener('click', (event) => {
            event.preventDefault()
            resetarFormularioProdutos()
        })
    }

    function mostrarSecao(idAlvo) {
        secoesConteudo.forEach(secao => {
            secao.style.display = 'none'
            secao.classList.remove('ativo')
        })

        const secaoAlvo = document.getElementById(idAlvo)

        if (secaoAlvo) {
            if (idAlvo !== 'tela-bem-vindo') {
                containerFormularios.style.display = 'flex'
            } else {
                containerFormularios.style.display = 'none'
            }
            secaoAlvo.style.display = 'flex'
            secaoAlvo.classList.add('ativo')
        }

        botoesNavegacao.forEach(botao => {
            botao.classList.remove('ativo')
            if (botao.dataset.target === idAlvo) {
                botao.classList.add('ativo')
            }
        })
    }

    botoesNavegacao.forEach(botao => {
        botao.addEventListener('click', () => {
            const idAlvo = botao.dataset.target
            mostrarSecao(idAlvo)
        })
    })

    const idSecaoInicial = document.querySelector('.botao-navegacao.ativo').dataset.target
    mostrarSecao(idSecaoInicial)

    document.body.classList.add('dom-carregado')
})