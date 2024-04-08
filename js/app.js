let cliente = {
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
        }
        return;
    }

    // Asignar datos del formulario a cliente 
    cliente = {
        ...cliente,
        mesa,
        hora
    }
    
    // Ocultar modal
    const modalFormulario = document.querySelector('#formulario');
    const modal = bootstrap.Modal.getInstance(modalFormulario);
    modal.hide();

    // Mostrar las Secciones Ocultas
    mostrarSecciones();
    
    // Obtener Plantillas de la API de JSON-Server
    obtenerPlatillos();
}

// Función para mostrar secciones ocultas
function mostrarSecciones() {
    // Selecciona todos los elementos con la clase 'd-none'
    const seccionesOcultas = document.querySelectorAll('.d-none');
    // Para cada elemento seleccionado, elimina la clase 'd-none'
    seccionesOcultas.forEach( seccion => seccion.classList.remove('d-none'));
}

// Función para obtener platillos de la API
function obtenerPlatillos() {
    // Punto final de la API
    const url = 'http://localhost:4000/platillos' || './db.json';

    // Obtiene datos de la API
    fetch(url)
        .then(respuesta => {
            // Si la respuesta no está bien, lanza un error
            if(!respuesta.ok) throw new Error(`Error en la solicitud: ${respuesta.status}`);
            // De lo contrario, analiza la respuesta a JSON
            return respuesta.json();
        })
        // Pasa la respuesta analizada a la función 'mostrarPlatillos'
        .then(resultado => mostrarPlatillos(resultado))
        // Registra cualquier error
        .catch(error => console.log(error))
}

function mostrarPlatillos(platillos) {
    // Selecciona el contenedor donde se mostrarán los platillos
    const contenido = document.querySelector('#platillos .contenido');

    // Itera sobre cada platillo
    platillos.forEach(platillo => {
        const { id, nombre, precio, categoria } = platillo; 

        // Crea un nuevo elemento DIV para cada platillo
        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top', 'align-items-center');
        
        // Crea y configura los elementos para el nombre, precio y categoría del platillo
        const nombreEl = document.createElement('DIV');
        nombreEl.classList.add('col-md-4');
        nombreEl.textContent = nombre;

        const precioEl = document.createElement('DIV');
        precioEl.classList.add('col-md-3', 'fw-bold');
        precioEl.textContent = `$${precio}`;

        const categoriaEl = document.createElement('DIV');
        categoriaEl.classList.add('col-md-3');
        categoriaEl.textContent = categorias[categoria];

        // Crea y configura un elemento de entrada para la cantidad de platillos a agregar
        const form = document.createElement('FORM');
        form.classList.add('col-md-2');

        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevenir el comportamiento predeterminado del evento de envío del formulario.
        });

        const inputEl = document.createElement('INPUT');
        inputEl.type = 'number';
        inputEl.min = 0;
        inputEl.value = 0;
        inputEl.id = `producto-${id}`;
        inputEl.classList = 'form-control';

        // Agrega un evento de cambio al elemento de entrada para actualizar la cantidad de platillos
        inputEl.addEventListener('change', () => {
            const cantidad = parseInt( inputEl.value );
            agregarPlatillo({...platillo, cantidad});
        })

        form.append(inputEl);

        // Agrega los elementos al contenedor principal
        row.append(nombreEl);
        row.append(precioEl);
        row.append(categoriaEl);
        row.append(form);

        // Agrega el contenedor principal al contenedor de platillos
        contenido.append(row);
    })
}

// Funcion para agregar un platillo al pedido del cliente.
function agregarPlatillo(producto) {
    // Extraer el pedido del cliente con Destructuring
    const { pedido } = cliente; 

    // Si la cantidad del producto es mayor que 0
    if(producto.cantidad > 0) {
        // Si el producto ya está en el pedido
        if(pedido.some( articulo => articulo.id === producto.id )) {
            // Actualiza la cantidad del producto en el pedido
            const pedidoActualizado = pedido.map( articulo => {
                if(articulo.id === producto.id) {
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            });
            cliente.pedido = [...pedidoActualizado]
        } else {
            // Si el producto no está en el pedido, lo agrega
            cliente.pedido = [...pedido, producto]
        }
    } else {
        // Si la cantidad del producto es 0, lo elimina del pedido
        const resultado = pedido.filter( articulo => articulo.id !== producto.id);
        cliente.pedido = [...resultado];
    }

    // Limpia el HTML del resumen del pedido
    limpiarHTML();

    // Si el pedido tiene al menos un producto, actualiza el resumen
    // De lo contrario, muestra un mensaje de pedido vacío
    cliente.pedido.length ? actualizarResumen() : mensajePedidoVacio();
}

// Función para actualizar el resumen del pedido en la interfaz de usuario
function actualizarResumen() {
    // Seleccionar el contenedor del resumen
    const contenido = document.querySelector('#resumen .contenido');

    // Crea un nuevo elemento DIV para el resumen
    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-3', 'px-3', 'shadow');

    // Crea y configura los elementos para la mesa y la hora
    const mesa = document.createElement('P');
    mesa.classList.add('fw-bold');
    mesa.textContent = 'Mesa: ';
    
    const mesaSpan = document.createElement('SPAN');
    mesaSpan.classList.add('fw-normal');
    mesaSpan.textContent = cliente.mesa;

    const hora = document.createElement('P');
    hora.classList.add('fw-bold');
    hora.textContent = 'Hora: ';
    
    const horaSpan = document.createElement('SPAN');
    horaSpan.classList.add('fw-normal');
    horaSpan.textContent = cliente.hora;

    // Agregar los elementos de mesa y hora al resumen
    mesa.append(mesaSpan);
    hora.append(horaSpan);

    // Crear un encabezado para la lista de platillos consumidos
    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Platillos Consumidos';

    // Crear una lista para mostrar los platillos consumidos
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    // Obtener el pedido del cliente
    const { pedido } = cliente;

    // Iterar sobre cada platillo en el pedido
    pedido.forEach(articulo => {
        const { id, nombre, precio, cantidad } = articulo;

        // Crear elementos HTML para mostrar los detalles del platillo
        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        const nombreEl = document.createElement('H4');
        nombreEl.classList.add('my-4')
        nombreEl.textContent = nombre;

        const cantidadEl = document.createElement('P');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`;

        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(precio, cantidad);

        // Crear un botón para eliminar el platillo del pedido
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar del Pedido';

        // Agregar un event listener para eliminar el platillo cuando se haga clic en el botón
        btnEliminar.addEventListener('click', () => {
            eliminarProducto(id);
        })

        // Agregar Valores a sus contenedores
        cantidadEl.append(cantidadValor);
        precioEl.append(precioValor);
        subtotalEl.append(subtotalValor);

        // Agregar elementos al LI
        lista.append(nombreEl);
        lista.append(cantidadEl);
        lista.append(precioEl);
        lista.append(subtotalEl);
        lista.append(btnEliminar);

        // Agregar lista al grupo principal
        grupo.append(lista);
    })

    // Agregar los elementos de mesa, hora y lista de platillos al resumen
    resumen.append(heading);
    resumen.append(mesa);
    resumen.append(hora);
    resumen.append(grupo);

    // Agregar el resumen al contenedor de resumen en la interfaz de usuario
    contenido.append(resumen);

    // Actualizar el formulario de propinas
    formularioPropinas();
}

// Función para calcular el subtotal de un platillo
function calcularSubtotal(precio, cantidad) {
    return `$ ${precio * cantidad}`;
}

// Función para eliminar un producto del pedido del cliente
function eliminarProducto(id) {
    // Obtener el pedido del cliente con destructuring
    const { pedido } = cliente;

    // Filtrar el pedido para obtener el resultado sin el producto a eliminar
    const resultado = pedido.filter(articulo => articulo.id !== id);

    cliente.pedido = [...resultado];

    limpiarHTML();

    // Verificar si el pedido del cliente está vacío y actuar en consecuencia
    if(cliente.pedido.length) {
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    // Actualizar el valor del input asociado al producto eliminado
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;

}

// Función para mostrar un mensaje cuando el pedido del cliente está vacío
function mensajePedidoVacio() {
    // Seleccionar el contenedor del resumen
    const contenido = document.querySelector('#resumen .contenido');

    // Crear un elemento de texto para el mensaje
    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido';

    contenido.append(texto);
}

// Función para generar el formulario de selección de propinas
function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido');

    // Crear un contenedor para el formulario de propinas
    const Divformulario = document.createElement('DIV');
    Divformulario.classList.add('col-md-6', 'mt-3', 'mt-md-0', 'formulario');
    
    // Crear el formulario de propinas
    const formulario = document.createElement('DIV');
    formulario.classList.add('card', 'py-3', 'px-3', 'shadow');

    // Heading
    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

    // 5%
    const radio5Div = document.createElement('DIV');
    radio5Div.classList.add('form-check');

    const radio5 = document.createElement('INPUT');
    radio5.type = 'radio';
    radio5.name = 'propina';
    radio5.value = '5';
    radio5.classList.add('form-check-input');
    radio5.addEventListener('click', calcularPropina);

    radio5Label = document.createElement('LABEL');
    radio5Label.classList.add('form-check-label');
    radio5Label.textContent = '5%';

    radio5Div.append(radio5);
    radio5Div.append(radio5Label);

    // 10%
    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.addEventListener('click', calcularPropina);

    radio10Label = document.createElement('LABEL');
    radio10Label.classList.add('form-check-label');
    radio10Label.textContent = '10%';

    radio10Div.append(radio10);
    radio10Div.append(radio10Label);

    // 15%
    const radio15Div = document.createElement('DIV');
    radio15Div.classList.add('form-check');

    const radio15 = document.createElement('INPUT');
    radio15.type = 'radio';
    radio15.name = 'propina';
    radio15.value = '15';
    radio15.classList.add('form-check-input');
    radio15.addEventListener('click', calcularPropina);

    radio15Label = document.createElement('LABEL');
    radio15Label.classList.add('form-check-label');
    radio15Label.textContent = '15%';

    radio15Div.append(radio15);
    radio15Div.append(radio15Label);

    // Agregar elementos al formulario de propinas
    formulario.append(heading);
    formulario.append(radio5Div);
    formulario.append(radio10Div);
    formulario.append(radio15Div);

    // Agregar el formulario al contenedor
    Divformulario.append(formulario);
    contenido.append(Divformulario);
}

// Función para calcular la propina y actualizar el total del pedido
function calcularPropina() {
    const { pedido } = cliente;

    // Inicializar el subtotal a 0
    let subtotal = 0;

    // Calcular el subtotal sumando el precio de cada artículo en el pedido
    pedido.forEach( articulo => {
        subtotal += articulo.precio * articulo.cantidad;
    })

    // Obtener el valor de la propina seleccionada
    const propinaSeleccionada = document.querySelector('input[type="radio"]:checked').value;
    
    // Calcular el monto de la propina
    const propina = subtotal * (parseInt(propinaSeleccionada) / 100);

    // Calcular el total sumando el subtotal y la propina
    const total = subtotal + propina;

    // Mostrar el subtotal, la propina y el total en la interfaz de usuario
    mostrarTotalHTML(subtotal, propina, total);
}

function mostrarTotalHTML(subtotal, propina, total) {
    // Crear un contenedor para mostrar los totales
    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar', 'my-3');

    // Crear elemento para mostrar el subtotal
    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    subtotalParrafo.textContent = 'Subtotal Consumo: '

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;

    subtotalParrafo.append(subtotalSpan);

    // Crear elemento para mostrar la propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    propinaParrafo.textContent = 'Propina: '

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;

    propinaParrafo.append(propinaSpan);

    // Crear elemento para mostrar el total
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    totalParrafo.textContent = 'Total: '

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParrafo.append(totalSpan);

    // Eliminar cualquier total previo si existe
    const totalPagar = document.querySelector('.total-pagar');

    if(totalPagar) {
        totalPagar.remove();
    }
    
    // Agregar los elementos de subtotal, propina y total al contenedor de totales
    divTotales.append(subtotalParrafo);
    divTotales.append(propinaParrafo);
    divTotales.append(totalParrafo);

    // Seleccionar el contenedor donde se agregarán los totales y agregar el contenedor de totales
    const contenedorTotal = document.querySelector('.formulario > div');
    contenedorTotal.append(divTotales); 
}

// Función para limpiar el contenido HTML del resumen del pedido.
function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido');

    // Eliminar todos los elementos hijos del contenido
    while( contenido.firstChild ) {
        contenido.removeChild(contenido.firstChild);
    }
}