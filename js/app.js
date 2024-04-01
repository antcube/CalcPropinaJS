const cliente = {
    mesa: '',
    hora: '',
    pedido: []
}

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

// Selector
const btnGuardarCliente = document.querySelector('#guardar-cliente');

window.addEventListener('load', () => {
    btnGuardarCliente.addEventListener('click', guardarCliente);
})

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    // Revisar si hay campos vacios
    const camposVacios = [mesa, hora].some(campo => campo === '');

    if(camposVacios) {
        // Verificar si existe una alerta previa
        const alertaExiste = document.querySelector('.invalid-feedback');

        if(!alertaExiste) {
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';

            document.querySelector('.modal-body form').append(alerta);

            setTimeout(() => {
                alerta.remove();
            }, 2000);
            return;
        }

    }
}