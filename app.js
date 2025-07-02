//VARIABLES GLOBALES
let IMAGEN = null;
let CANVAS = null;
let CONTEXT = null;
let SIZE = {width:0,height:0};
let TAMAÑO = 3;
let PIEZAS = [];
let PIEZA_SELECCIONADA = null;
let EMPTYPOS = {x: -1, y: -1}
let MATRIZ_LOGICA;
let MATRIZ_OBJETIVO
let dictObjetivo = {}
let SOLUCION = [];
const profundidadMax = 250;
const estadosProbadosMax = 5000000;


/** 
 * @summary
 * Define variables globales:
 *  -IMAGEN = La imagen que utilizara para el puzzle 
 *  -CANVAS = El canvas en donde se encontrara la imagen y los parametros de ancho y largo 
 *  -CONTEXT = Los valores de renderizado en un canvas 
 *  -SIZE = Los valores de ancho y largo de cada pieza 
 * 
 * Llama a las funciones necesarias para generar el puzzle
 */
function main(imagen){
    if(imagen === undefined)
        imagen = "imagen1"
    IMAGEN = document.getElementById(imagen);
    CANVAS = document.getElementById('myCanvas');
    CONTEXT = CANVAS.getContext('2d');//Se utilizara el renderizado en 2d (para imagenes, formas, texto)

    // Calcula el factor para ajustar la imagen, de modo que se ajuste a un tamaño máximo de 900x600.
    let resizer = Math.min(
        900/IMAGEN.width,  // Calcula el factor en función del ancho.
        600/IMAGEN.height  // Calcula el factor en función de la altura.
    );

    // Ajusta el ancho y la altura del canvas y SIZE según el factor de factor calculado, restando 100 para que no se vea tan grande .
    CANVAS.width = resizer*IMAGEN.width-100;
    CANVAS.height = resizer*IMAGEN.height-100;
    SIZE.width = resizer*IMAGEN.width-100;
    SIZE.height = resizer*IMAGEN.height-100;

    // Carga las piezas de la imagen en el canvas.
    cargarPiezas();
    updateCanva();
    // Aqui se añade la funcion para que las piezas se muevan de forma grafica
    CANVAS.addEventListener("click",onclick);
}


/**
 * @description Actualiza la posicion de las piezas de forma grafica
 */
function updateCanva(){
    CONTEXT.clearRect(0,0,CANVAS.width,CANVAS.height);// Limpia el canvas
    CONTEXT.globalAlpha = 0.1;// Establece la transparencia del canvas a 0.1 para que la imagen quede de fondo de las piezas 
    CONTEXT.drawImage(IMAGEN,0,0,SIZE.width,SIZE.height);// Dibuja la imagen en el canvas
    CONTEXT.globalAlpha = 1;// Restablece la transparencia del canvas a 1 para dibujar las piezas.
    
    for(let i = 0; i<PIEZAS.length; i++){// Recorre todas las piezas y las dibuja en el canvas.
        PIEZAS[i].draw(CONTEXT);
    }
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


/**
 * @param {Array<Int>} lista - Lista de pares pares ordenados que ya se han generado 
 * @param {Int} top - El tope para la serie pares ordenados que puede generar
 * @returns {Array<Int>} - Array que no se encuentre en la lista 
 * 
 * @description - Genera pares de numeros que no se encuntren en la lista dada como parametro
 */
function generateNotInList(lista, top){
    for(let i = 0; i<top; i++){
        for(let j = 0; j<top; j++){
            if(!lista.some(([x, y]) => x === i && y === j))// Si el par generado no existe en la lista
                return[i,j]
        }
    }
}

/**
 * 
 * @param {Array<Int>} lista - Lista de pares pares ordenados que ya se han generado 
 * @param {Int} top - El tope para la serie pares ordenados aleatorios que puede generar
 * @returns {Array<Int>} - Array aleatorio que no se encuentre en la lista 
 * 
 * @description - Genera pares de numeros aleatorios que no se encuntren en la lista dada como parametro
 */
function generateRandomNotInList(lista, top){
    let randomX = 0;
    let randomY = 0;
    do{
        randomX = Math.floor(Math.random() * top-1)+1;
        randomY = Math.floor(Math.random() * top-1)+1;
    }while(lista.some(([x, y]) => x === randomX && y === randomY));// Do while el generado se encuentre en la lista
    return [randomX,randomY]// Cuando el generado no se encuentra en la lista se retorna
}

/**
 * @description - Funcion para "revolver" de forma aleatoria las piezas de las imagenes
 */
function shuffle(){
    let tempList = [];// Array para guardar los pares ordenados aleatorios que ya se han generado 
    let randomX = 0;
    let randomY = 0;
    let randomPos = [];
    for(let i = 0; i<PIEZAS.length; i++){// Por cada pieza del tablero
        randomPos = generateRandomNotInList(tempList,TAMAÑO);
        tempList.push(randomPos);
        randomX = randomPos[0];
        randomY = randomPos[1];
        let loc = {// Se genera el aleatorio x,y
            x:(SIZE.width*randomX/TAMAÑO),
            y:(SIZE.height*randomY/TAMAÑO)
        }
        PIEZAS[i].x=loc.x;// Se asigna el x aleatorio
        PIEZAS[i].y=loc.y;// Se asigna el y aleatorio
        MATRIZ_LOGICA[randomY][randomX] = PIEZAS[i].numero// Se guarda el numero de pieza en la matriz de logica 
    }
    updateCanva();
    const pos = generateNotInList(tempList, TAMAÑO)// Se genera la posicion que no esta en la lista (la posicion de la pieza 9)
    EMPTYPOS.x = pos[0];// Se actualiza el x de la posicion vacia 
    EMPTYPOS.y = pos[1];// Se actualiza el y de la posicion vacia 
    MATRIZ_LOGICA[pos[1]][pos[0]] = 0// Se actualiza la posicion vacia en la matriz de logica
}

/**
 * @description Parte la imagen en piezas y las carga en la canva
 * Tambien define las variables globales: 
 *  {Array<Pieza>} PIEZAS = Las piezas que estaran el el canvas;
 *  {Array<Array<Int>>} MATRIZ_LOGICA = La matriz reflejo de las piezas graficas
 *  {Array<Array<Int>>} MATRIZ_OBJETIVO = La matriz a la que se nesecita llegar
 */
function cargarPiezas(){
    PIEZAS = [];
    MATRIZ_LOGICA = []
    MATRIZ_OBJETIVO = []
    counter = 1 // Contador de piezas generadas 
    for(let i = 0; i<TAMAÑO; i++){
        MATRIZ_LOGICA.push([]) 
        MATRIZ_OBJETIVO.push([])
        for(let j = 0; j<TAMAÑO; j++){
            PIEZAS.push(new Pieza(i,j,counter))
            PIEZAS[PIEZAS.length-1].x = SIZE.width*j/TAMAÑO
            PIEZAS[PIEZAS.length-1].y = SIZE.height*i/TAMAÑO
            MATRIZ_OBJETIVO[i][j] = counter // Se guarda el numero de pieza generada 
            MATRIZ_LOGICA[i][j] = counter // Se guarda el numero de pieza generada 
            dictObjetivo[counter] = [i,j] // Se guarda la posicion del numero de pieza generada 
            counter++;
        }
    }
    // Se elimina la ultima pieza para que los movimientos sean posibles
    MATRIZ_OBJETIVO[TAMAÑO-1][TAMAÑO-1] = 0;
    MATRIZ_LOGICA[TAMAÑO-1][TAMAÑO-1] = 0;
    delete dictObjetivo[counter-1]
    PIEZAS.pop()
    EMPTYPOS.x = TAMAÑO-1
    EMPTYPOS.y = TAMAÑO-1
}

/**
 * @param {Pieza} pieza La pieza a mover en la canva 
 * 
 * @description Mueve la pieza que entra por parametro a la posicion vacia si esta pieza se encuentra a la par de la posicion vacia
 */
function moverPieza(pieza){

    if(pieza === undefined)
        return;
    const movimientoX = (SIZE.width/TAMAÑO)
    const movimientoY = (SIZE.height/TAMAÑO)
    
    // Calcula la posición vacía en el canvas.
    const emptyX = (movimientoX*EMPTYPOS.x).toFixed(2);
    const emptyY = (movimientoY*EMPTYPOS.y).toFixed(2);

    const posPiezaX = (pieza.x)
    const posPiezaY = (pieza.y)

    // Verifica si la pieza puede moverse a la derecha hacia la posición vacía.
    if((posPiezaX+movimientoX).toFixed(2) === emptyX && (posPiezaY).toFixed(2) === emptyY){
        // Actualiza la matriz lógica para reflejar el movimiento de la pieza.
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = pieza.numero;
        EMPTYPOS.x = pieza.x/(SIZE.width/TAMAÑO);
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = 0;
        // Mueve la pieza a la derecha.
        pieza.x = pieza.x+SIZE.width/TAMAÑO;
    }
    // Verifica si la pieza puede moverse a la izquierda hacia la posición vacía.
    if((posPiezaX-movimientoX).toFixed(2) === emptyX && (posPiezaY).toFixed(2) === emptyY){
        // Actualiza la matriz lógica para reflejar el movimiento de la pieza.
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = pieza.numero;
        EMPTYPOS.x = pieza.x/(SIZE.width/TAMAÑO);
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = 0;
        // Mueve la pieza a la izquierda.
        pieza.x = pieza.x-SIZE.width/TAMAÑO;
    }
    // Verifica si la pieza puede moverse hacia abajo hacia la posición vacía.
    if((posPiezaY+movimientoY).toFixed(2) === emptyY && (posPiezaX).toFixed(2) === emptyX){
        // Actualiza la matriz lógica para reflejar el movimiento de la pieza.
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = pieza.numero;
        EMPTYPOS.y = Math.round(pieza.y/(SIZE.height/TAMAÑO));
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = 0;
        // Mueve la pieza hacia abajo.
        pieza.y = pieza.y+SIZE.height/TAMAÑO;
    }
    // Verifica si la pieza puede moverse hacia arriba hacia la posición vacía.
    if((posPiezaY-movimientoY).toFixed(2) === emptyY && (posPiezaX).toFixed(2) === emptyX){
        // Actualiza la matriz lógica para reflejar el movimiento de la pieza.
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = pieza.numero;
        EMPTYPOS.y = pieza.y/(SIZE.height/TAMAÑO);
        MATRIZ_LOGICA[EMPTYPOS.y][EMPTYPOS.x] = 0;
        // Mueve la pieza hacia arriba.
        pieza.y = pieza.y-SIZE.height/TAMAÑO;
    }
    // Actualiza el canvas para reflejar los cambios.
    updateCanva();
}

/**
 * @param {evt} loc 
 * @returns {Pieza} La pieza que el usuario tocó
 * 
 * @description Recibe el evt cuando se hace click en la pagina y devuelve la pieza que se aproxima a la posicion cliqueada
 */
function getPiezaSeleccionada(loc){
    // Obtiene el tamaño del elemento CANVAS y su posición relativa al viewport.
    const rect = CANVAS.getBoundingClientRect();
//    console.log(loc)
    for(let i = 0; i<PIEZAS.length;i++){
        // Verifica si la posición del clic del usuario (loc.x, loc.y) está dentro de la pieza actual.
        if(loc.x - rect.x > PIEZAS[i].x
        && loc.x - rect.x < PIEZAS[i].x+PIEZAS[i].width 
        && loc.y - rect.y > PIEZAS[i].y
        && loc.y - rect.y < PIEZAS[i].y+PIEZAS[i].height)
        {
            // Si el clic del usuario está dentro de la pieza, devuelve esa pieza
            return PIEZAS[i];
        }
    }
    return null
}

/**
 * @param {evt} evt 
 * 
 * @description Fucion que confirma y realiza el movimiento de una pieza
 */
function onclick(evt){
    PIEZA_SELECCIONADA = getPiezaSeleccionada(evt);
    console.log(PIEZA_SELECCIONADA)
    if(PIEZA_SELECCIONADA != null){// Si hay una pieza en el rango del click y esta junto a una posicion vacia 
        moverPieza(PIEZA_SELECCIONADA)// Se mueve esa pieza
    }
}


/***********************************-ALGORITMO DE BACKTRACKING*-**************************************************************** */


/**
 * @param {Array<Array<Int>>} estado - Estado que contiene la matriz actual
 * @param {Array<Int>} posVacia - Contiene la fila y columna en la cual se encuentra el vacio 
 * @param {MatrixStorage} estadosProbados - Contiene las matrices ya probadas 
 * @param {Array<Array<Int>>} caminos - Contiene los diversos movientos realizados para llegar a una posible solucion 
 * @param {Array<Array<Int>>} solucion - Contiene el estado al que se quiere llegar, condicion principal de salida
 * @param {Int} profundidad - Es la maxima profundidad de recursion
 * @returns {Array<Array<Int>>} resultado - El camino solucion o un -1 en caso de no encotrarla.
 * 
 * @description - Busca un posible camino solucion usando la tecnica de backtracking
 */
function backtracking(estado, posVacia, estadosProbados, caminos, solucion, profundidad){
    //console.log("\nAvanzando al estado: ")
    //printMatriz(estado);
    //console.log("Profundidad: ", profundidad);
    if(JSON.stringify(estado) === JSON.stringify(solucion)){        // se verifica si el estado actual es la solucion
        return caminos;                 
    }

    if(profundidad < 1 || estadosProbados.size() > estadosProbadosMax){        // se verifica que no se exceda el limite de profundidad y estados probados
        return -1;
    }

    // se inicializan los posibles caminos y estados, y se generan 
    let posiblesCaminos = [];       
    let posiblesEstados = [];
    generarPosiblesSoluciones(estado, posVacia, posiblesCaminos, posiblesEstados);
    
    // recorre todos los posibles estados generados
    for(let i = 0; i < posiblesEstados.length; i++){

        // se obtiene el nuevo estado y camino actual generado
        let nuevoEstado = posiblesEstados[i];
        let nuevoCamino = posiblesCaminos[i];

        if (!estadosProbados.isTestedMatrix(nuevoEstado)) {         // se verifica que el nuevo estado no haya sido probado 
            let nuevosCaminos = deepCopyArray(caminos);             // se crea una copia real del camino actual
            nuevosCaminos.push(nuevoCamino);                        // se agrega el nuevo camino a la copia
            estadosProbados.addTestedMatrix(nuevoEstado);           // se agrega el nuevo estado probado a los estados probados
            // llamada recursiva con los datos actualizados
            let resultado = backtracking(nuevoEstado, nuevoCamino, estadosProbados, nuevosCaminos, solucion, profundidad - 1); 

            if(resultado != -1){                                    // se comprueba si el estado es solucion
                return resultado                                    // de serlo, se retorna el camino encontrado
            }

            //console.log("\nRetrocediendo al estado: ")
            //printMatriz(estado);
            //console.log("Profundidad: ", profundidad);
        }
    } 

    return -1
}

/**
 * @param {Array<Array<Int>>} estado - Estado que contiene la matriz actual
 * @param {Array<Int>} posVacia - Contiene la fila y columna en la cual se encuentra el vacio 
 * @param {Array<Array<Int>>} posiblesCaminos - Guarda los nuevos posibles caminos segun el estado actual
 * @param {Array<Array<Int>>} posiblesEstados - Guarda los nuevos posibles estados segun el estado actual
 * 
 * @description - para un estado ingresado, genera los nuevos posibles movimientos
 */
function generarPosiblesSoluciones(estado, posVacia, posiblesCaminos, posiblesEstados){
    const fila = posVacia[0];
    const columna = posVacia[1];
    const n = estado.length;

    if (fila > 0){              //pasar el vacio para arriba
        let posibleEstado = deepCopyArray(estado);
        const temp = posibleEstado[fila][columna];
        posibleEstado[fila][columna] = posibleEstado[fila - 1][columna];
        posibleEstado[fila - 1][columna] = temp;
        posiblesEstados.push(posibleEstado);
        posiblesCaminos.push([fila - 1, columna]);
    }

    if (fila < n - 1){          //pasar el vacio para abajo
        let posibleEstado = deepCopyArray(estado);
        const temp = posibleEstado[fila][columna];
        posibleEstado[fila][columna] = posibleEstado[fila + 1][columna];
        posibleEstado[fila + 1][columna] = temp;
        posiblesEstados.push(posibleEstado);
        posiblesCaminos.push([fila + 1, columna]);
    }

    if (columna > 0){           //pasar el vacio para la izquierda
        let posibleEstado = deepCopyArray(estado);
        const temp = posibleEstado[fila][columna];
        posibleEstado[fila][columna] = posibleEstado[fila][columna - 1];
        posibleEstado[fila][columna - 1] = temp;
        posiblesEstados.push(posibleEstado);
        posiblesCaminos.push([fila, columna - 1]);
    }

    if (columna < n - 1){       //pasar el vacio para la derecha
        let posibleEstado = deepCopyArray(estado);
        const temp = posibleEstado[fila][columna];
        posibleEstado[fila][columna] = posibleEstado[fila][columna + 1];
        posibleEstado[fila][columna + 1] = temp;
        posiblesEstados.push(posibleEstado);
        posiblesCaminos.push([fila, columna + 1]);
    }
}

/**
 * @param {Array<Int>} arr - Matriz que se desea copiar
 * @returns {Array<Int>}  - La matriz copia creada
 * 
 * @description - dado una matriz, genera una nueva copia de esta, que no modique la original
 */

function deepCopyArray(arr) {
    return arr.map(item => Array.isArray(item) ? deepCopyArray(item) : item);
}

/**
 * @param {Int} fil - fila de la pieza a buscar
 * @param {Int} col - columna de la pieza a buscar
 * @returns {Pieza} - La pieza encontrada
 * 
 * @description - dado una fila y columna, busca cual pieza cumple con dichas posiciones
 */

function buscarPieza(fil, col){
    x = SIZE.width*col/TAMAÑO;      // ajustar la columna
    y = SIZE.height*fil/TAMAÑO;     // ajustar la fila

    // se busca la pieza que cumpla con la fila y columna ingresada
    for(let i = 0; i<PIEZAS.length;i++){
        if(PIEZAS[i].x === x && PIEZAS[i].y === y){
            return PIEZAS[i]    
        }
    }
}


/**
 * @param {Array<Array<Int>>} resultado - El camino solucion encontrado
 * @param {Array<Int>} posVacia - array que contiene la fila y la columna de la posicion vacia
 * 
 * @description - dado un camino solucion, imprime en un cuadro de texto los pasos a seguir
 */
async function colocarSolucion(resultado, posVacia){    
    let fil = posVacia[0];
    let col = posVacia[1];
    SOLUCION = [];
    contador = 1

    for (const movimiento of resultado) {
        SOLUCION.push(movimiento)
        // se obtiene la fila y columna del moviento que hay que hacer
        const filSig = movimiento[0];
        const colSig = movimiento[1];

        // se imprime el movimiento actual en el campo de texto de la solucion
        if (fil < filSig){ 
            document.getElementById("textareaSolution").value += contador + ". [" + filSig + "," + colSig + "] hacia arriba \n"; 
        }
        else if (fil > filSig){ 
            document.getElementById("textareaSolution").value += contador + ". [" + filSig + "," + colSig + "] hacia abajo \n"; 
        }
        else if (col < colSig){ 
            document.getElementById("textareaSolution").value += contador + ". [" + filSig + "," + colSig + "] hacia la izquierda \n"; 
        }
        else if (col > colSig){ 
            document.getElementById("textareaSolution").value += contador + ". [" + filSig + "," + colSig + "] hacia la derecha \n";
        }

        //actualizar las filas actuales y el contador
        fil = filSig;
        col = colSig;
        contador++;
    }
    SOLUCION.reverse()
}

/**
 * 
 * @description - inicializa los datos para llamar al backtracking y mostrar el posible resultado 
 */

function calcularSolucionConBacktracking(){
    let matrizBase = deepCopyArray(MATRIZ_OBJETIVO);    // matriz solucion
    let matrizRand = deepCopyArray(MATRIZ_LOGICA);      // matriz aleatoria generada
    let posVacia = [];                                  // posicion en la que se encuentra el espacio vacio
    posVacia.push(EMPTYPOS.y);                          // se guarda la fila de la pos vacia
    posVacia.push(EMPTYPOS.x);                          // se guarda la columna de la pos vacia

    let estadosProbados = new MatrixStorage();          // se inicializa la clase a usar como estados probados
    estadosProbados.addTestedMatrix(matrizRand);        // se agrega la matriz rand de la que se parte a los estados probados 
    const profundidad = Math.trunc(profundidadMax / TAMAÑO);     // profundidad limite
    console.log("Profundidad usada: ", profundidad);    

    resultado = backtracking(matrizRand, posVacia, estadosProbados, [], matrizBase, profundidad);   // se obtiene el resultado
    console.log("Cantidad de estados probados: ", estadosProbados.size());          
    
    document.getElementById("textareaSolution").value = "";
    
    if (resultado != -1) {                              // si da diferente de -1 encontro una solucion
        colocarSolucion(resultado, posVacia);       // coloca la solucion encontrada en el campo de texto
        return;
    }
    else{                                               // caso en el que no haya solucion posible, o los recursos no son suficientes
        document.getElementById("overlayNoSolucion").style.display = "flex";
    }
}


/***********************************-ALGORITMO DE A*-**************************************************************** */

/**
 * 
 * @param {Array<Array<Int>>} startState // Estado en el que inicia el juego al presionar el boton
 * @param {Function} calcularPosiblesMovimientos // Funcion que calcula los posibles movimientos para el estado actual
 * @returns {Node}El nodo para llegar a la solucion 
 * 
 */
function calcularSolucionConAEstrella(startState, calcularPosiblesMovimientos) {
    let frontier = new PriorityQueue();// Variable que lleva cuenta de todas las soluciones posibles 
    frontier.enqueue(new Node(startState, null, null, 0, calcularHeuristica(startState)));// Se guarda la primera con la matriz que inicia el juego
    let explored = new Set(); // Para saber cuales soluciones ya se consideraron  
    let matrizMovida;
    let movimientos;
    let childNode;
    let copiaEstado;
    let node;
    let iteraciones = 0;
    let contador = 1;
    let fila = 0;
    let columna = 0;
    let topes = {3:2000,4:8000, 5:50000, 6:50000, 7:50000, 8:50000, 9:50000, 10:50000, 11:50000, 12:50000, 13:50000, 14:50000, 15:50000, 16:50000, 17:50000, 18:50000, 19:50000, 20:50000, }
    while (!frontier.isEmpty()) { //Mientras hayan posibles soluciones
        node = frontier.dequeue();// Se saca/almacena el primer nodo de la cola
        //printMatriz(node.state)
        //console.log(node.priority - node.pathCost)
        if(node.state[fila][columna] === contador && fila < TAMAÑO - 2){
            columna++;
            contador++;
            if(columna === TAMAÑO-1){
                columna = 0 
                fila++
            }
            frontier = new PriorityQueue()
            //console.log(contador)
        }
        if (-(TAMAÑO**3)+TAMAÑO === node.priority - node.pathCost) {// SI el estado del nodo tiene una prioridad deseada
            //console.log(iteraciones)
            return node;
        }
        // Si no es
        explored.add(node.state.toString());// Se almacena esa solucion
        if(iteraciones === topes[TAMAÑO])
            break;

        movimientos = calcularPosiblesMovimientos(node.state);// Se calcula que movimientos se pueden hacer 

        for (let movimiento of movimientos) {
            if(movimiento.length !== 0){
                copiaEstado = JSON.parse(JSON.stringify(node.state))// Se saca una copia del estado actual 
                // Se genera un nuevo nodo a partir de la conpia con el movimiento 
                matrizMovida = realizarMovimiento(copiaEstado,movimiento[0],movimiento[1])
                childNode = new Node(matrizMovida, node, movimiento, node.pathCost + 1, calcularHeuristica(matrizMovida));
                if (!explored.has(childNode.state.toString())) {// Si el nuevo nodo no esta registrado 
                    frontier.enqueue(childNode);// Se almacena en la cola de soluciones 
                }
            }
        }
        iteraciones++;
    }
    return null;
}

/**
 * @param {Array<Array<Int>>} estadoActual Matriz  
 * @returns Suma de distancias de todas las piezas hacia donde deberian de estar en la Matriz
 * 
 * @description Analiza y suma que tan lejos estan las piezas de su posicion objetivo y retorna esta suma entre la cantidad de piezas en el canvas 
 */
function calcularHeuristica(estadoActual){
    let distanciaTotal = 0;
    let distancia;
    let posObjetivoNumActual;
    let numActual;
    for(let i = 0; i < estadoActual.length; i++){
        for(let j = 0; j < estadoActual.length; j++){
            
            numActual = estadoActual[i][j]// Numero en la posicion actual

            posObjetivoNumActual = dictObjetivo[numActual]// Se saca la posicion en la que deberia de estar la pieza con numero actual

            if(posObjetivoNumActual === undefined) continue // En caso que el numero se 0 (No tiene una posicion objetivo)

            // Calcula la distancia de Manhattan para la pieza actual
            distancia = Math.abs(i - posObjetivoNumActual[0]) + Math.abs(j - posObjetivoNumActual[1]);

            // Ajusta la distancia si hay una pieza en el camino
            if ((i != posObjetivoNumActual[0] && estadoActual[posObjetivoNumActual[0]][j] != 0) ||
                (j != posObjetivoNumActual[1] && estadoActual[i][posObjetivoNumActual[1]] != 0)) {
                distancia *= TAMAÑO;//  Ajusta el costo
            }//else
            else if(distancia === 0)
                distanciaTotal -= TAMAÑO
            distanciaTotal += distancia;
        }
    }
    return distanciaTotal;
}

/**
 * @param {Array<Array<Int>>} estadoActual Matriz de numeros con una posicion vacia 
 * @returns Posibles posiciones a las que se puede mover el 0 
 * 
 * @description Analida las los lados de la posicion vacia y retorna cuales son las posiciones a las que puede ir 
 */
function calcularMovimientosParaVacio(estadoActual){
    // Obtiene la posición vacía en el estado actual.
    let posVacia = posicionVacia(estadoActual);
    // Inicializa las variables que representan los posibles movimientos.
    let moverDerecha = 1000;
    let moverIzquierda = 1000;
    let moverArriba = 1000;
    let moverAbajo = 1000;

    
    if(posVacia[0]+1 < TAMAÑO) // Verifica si es posible moverse hacia abajo
        moverAbajo = 1;
    if(posVacia[0]-1 >= 0) // Verifica si es posible moverse hacia arriba
        moverArriba = 1;
    if(posVacia[1]-1 >= 0)// Verifica si es posible moverse hacia la izquierda
        moverIzquierda = 1;
    if(posVacia[1]+1 < TAMAÑO) // Verifica si es posible moverse hacia la derecha
        moverDerecha = 1;
    
    let posiblesMovimientos = [];// Array para almacenar los posibles movimientos
    
    // Si es posible moverse hacia la derecha, añade este movimiento a la lista de posibles movimientos.
    if(1000 !== moverDerecha) 
        posiblesMovimientos.push([posVacia, [posVacia[0],posVacia[1]+1]]);
    
    // Si es posible moverse hacia la izquierda, añade este movimiento a la lista de posibles movimientos.
    if(1000 !== moverIzquierda) 
        posiblesMovimientos.push([posVacia, [posVacia[0],posVacia[1]-1]]);
    
    // Si es posible moverse hacia arriba, añade este movimiento a la lista de posibles movimientos.
    if(1000 !== moverArriba) 
        posiblesMovimientos.push([posVacia, [posVacia[0]-1,posVacia[1]]]);
    
    // Si es posible moverse hacia abajo, añade este movimiento a la lista de posibles movimientos.
    if(1000 !== moverAbajo)
        posiblesMovimientos.push([posVacia, [posVacia[0]+1,posVacia[1]]]);
    
    // Devuelve la lista de posibles movimientos.
    return posiblesMovimientos;
}


/**
 * @param {Array<Array<Int>>} estadoActual Copia de la matriz actualmente
 * @param {Array<Int>} posicionInicial La posicion del numero que se va a mover 
 * @param {Array<Int>} posicionFinal La posicion destino del numero que se va a mover
 * @returns {Array<Array<Int>>} La matriz despues de realizar el moviento 
 * 
 * @description Aplica los cambios de numeros para aparentar un "movimiento" de pieza a la matriz de numeros 
 */
function realizarMovimiento(estadoActual, posicionInicial, posicionFinal){
    estadoActual[posicionInicial[0]][posicionInicial[1]] = estadoActual[posicionFinal[0]][posicionFinal[1]]
    estadoActual[posicionFinal[0]][posicionFinal[1]] = 0;
    return estadoActual;
}


/******************************************* funciones sin importancia ****************************************************************/


/**
 * @param {Node} nodo 
 * 
 * @description Se "devuelve" en el grafo para encontrar la serie de pasos para llegar a la solucion 
 */
function solucionToString(nodo){
    SOLUCION = [];
    let temp = nodo;
    if(temp.action === null){
        document.getElementById("textareaSolution").value = "LISTO"
        return 
    }
    let contador = temp.pathCost;
    document.getElementById("textareaSolution").value = ""
    while(temp.action != null){// El unico nodo con el parametro action en null es el primero 
        document.getElementById("textareaSolution").value = contador + movimientoToString(temp.action) + document.getElementById("textareaSolution").value 
        SOLUCION.push(temp.action[1])        
        temp = temp.parent// Se "sube" en el grafo 
        contador--;
    }
    document.getElementById("textareaSolution").value += "LISTO"
}

/**
 * @param {Array<Array<Int>>} movimiento El movimiento realizado [PosicionInicial, PosicionFinal]
 * @returns {String} String de pasos a seguir para llegar a la solucion
 * 
 * @description retornar la serie de pasos a seguir para llegar a la solucion del puzzle
 * 
 */
function movimientoToString(movimiento){
    let posicionInicial = movimiento[0]
    let posicionFinal = movimiento[1]
    const movimientofila = posicionFinal[0] - posicionInicial[0]
    const movimientoColumna= posicionFinal[1] - posicionInicial[1]
    if(movimientofila === 1) return ". " + posicionFinal + " hacia arriba\n"
    else if(movimientofila === -1) return ". " + posicionFinal + " hacia abajo\n"
    else if(movimientoColumna === 1) return  ". " + posicionFinal + " hacia izquierda\n"
    else if(movimientoColumna === -1) return  ". " + posicionFinal + " hacia derecha\n"
}


/**
 * Imprime una matriz en la consola.
 * @param {Array} matriz - La matriz que se va a imprimir.
 */
function printMatriz(matriz){
    for(let i = 0; i < matriz.length; i++){
        console.log(matriz[i]);
    }
    console.log(" ");
}

/**
 * Encuentra la posición de la celda vacía (0) en un estado dado.
 * @param {Array} estado - El estado actual del tablero.
 * @returns {Array} Un array con las coordenadas [j,i] de la celda vacía.
 */
function posicionVacia(estado){
    for(let i = 0; i < estado.length; i++){
        for(let j = 0; j < estado.length; j++){
            if(estado[j][i] === 0) return [j,i];
        }
    }
}

/**
 * Compara dos matrices para verificar si son iguales.
 * @param {Array} a - La primera matriz a comparar.
 * @param {Array} b - La segunda matriz a comparar.
 * @returns {boolean} Devuelve true si las matrices son iguales, false en caso contrario.
 */
function matrixEqual(a,b){
    if(a.length === b.length){
        for(let i = 0; i < a.length; i++){
            for(let j = 0; j < a.length; j++){
                if(!(a[j][i] === b[j][i]))
                    return false;
            }
        }
        return true;
    }
}


document.getElementById("generate").addEventListener("click", function(evt){
    TAMAÑO = parseInt(document.getElementById("tamaño").value);
    document.getElementById("textareaSolution").value = ""
    cargarPiezas();
    updateCanva();
});

document.getElementById("getSolutionA*").addEventListener("click", function(evt){
    let solucion = calcularSolucionConAEstrella(MATRIZ_LOGICA, calcularMovimientosParaVacio)
    if(solucion !== null){
        solucionToString(solucion)
    }
    else
        document.getElementById("overlayNoSolucion").style.display = "flex";
});

document.getElementById("getSolutionBacktracking").addEventListener("click", function(evt){
    calcularSolucionConBacktracking();
});

document.getElementById("reiniciar").addEventListener("click", function(evt){
    document.getElementById("overlayNoSolucion").style.display = "none";
    cargarPiezas();
    updateCanva();
});

document.getElementById("continuar1").addEventListener("click", function(evt){
    document.getElementById("overlayNoSolucion").style.display = "none";
});


document.getElementById("continuar2").addEventListener("click", function(evt){
    document.getElementById("overlayNoSearchSolucion").style.display = "none";
});

document.getElementById("solve").addEventListener("click", async function(evt){
    if(SOLUCION === null){
        document.getElementById("overlayNoSearchSolucion").style.display = "flex";
    }else{
        for(let i = SOLUCION.length-1; i >= 0; i--){
            console.log(SOLUCION[i])
            let pieza = buscarPieza(SOLUCION[i][0],SOLUCION[i][1])
            moverPieza(pieza)
            await esperar(500)
        }
    };
});

function arraysEqual(a, b) { 
    return a.length === b.length && a.every((val, index) => val === b[index]); 
} 


document.getElementById("imagen1_seleccionada").addEventListener("click", function(evt){
    main("imagen1");
});

document.getElementById("imagen2_seleccionada").addEventListener("click", function(evt){
    main("imagen2");

});

document.getElementById("imagen3_seleccionada").addEventListener("click", function(evt){
    main("imagen3");

});

document.getElementById("imagen4_seleccionada").addEventListener("click", function(evt){
    main("imagen4");

});

document.getElementById("imagen5_seleccionada").addEventListener("click", function(evt){
    main("imagen5");

});

document.getElementById("imagen6_seleccionada").addEventListener("click", function(evt){
    main("imagen6");

});

document.getElementById("suffle").addEventListener("click", function(evt){
    document.getElementById("textareaSolution").value = ""
    SOLUCION = null
    shuffle();
});
/******************************************* Clases ****************************************************************/

class Pieza{
    constructor(fila, columna, numero){
        this.fila = fila;
        this.columna = columna;
        this.x = SIZE.width*this.columna/TAMAÑO;
        this.y = SIZE.height*this.fila/TAMAÑO;
        this.width = SIZE.width/TAMAÑO;
        this.height = SIZE.height/TAMAÑO;
        this.numero = numero
    }
    draw(context){
        context.beginPath();
        context.drawImage(IMAGEN
            , this.columna*IMAGEN.width/TAMAÑO
            , this.fila*IMAGEN.height/TAMAÑO
            , IMAGEN.width/TAMAÑO
            , IMAGEN.height/TAMAÑO
            , this.x
            , this.y
            , this.width
            , this.height
            );
        context.rect(this.x,this.y,this.width,this.height);
        context.stroke();
    }
}

function PriorityQueue() {
    this.elements = [];
}

PriorityQueue.prototype.enqueue = function (e) {
    this.elements.push(e);
    this.elements.sort((a, b) => a.priority - b.priority);
};

PriorityQueue.prototype.dequeue = function () {
    return this.elements.shift();
};

PriorityQueue.prototype.isEmpty = function () {
    return !this.elements.length;
};

function Node(state, parent, action, pathCost, heuristicCost) {
    this.state = state;
    this.parent = parent;
    this.action = action;
    this.pathCost = pathCost;
    this.priority = pathCost + heuristicCost;
}

class MatrixStorage {
    constructor(){
        this.testedMatrices = new Set();
    }

    serializeMatrix(matrix){
        return JSON.stringify(matrix);
    }

    addTestedMatrix(matrix){
        const key = this.serializeMatrix(matrix);
        this.testedMatrices.add(key);
    }

    isTestedMatrix(matrix){
        const key = this.serializeMatrix(matrix);
        return this.testedMatrices.has(key);
    }
    createCopy() {
        let nuwStorageMatrix = new MatrixStorage();
        nuwStorageMatrix.testedMatrices = new Set(this.testedMatrices);
        return nuwStorageMatrix;
    }
    size() {
        return this.testedMatrices.size;
    }
}
