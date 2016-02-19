//инициализация всего и вся
//обработка входных данных - ???
//отрисовка - draw 

//глобальные переменные
//говорят, в яваскрипте их нужно объявлять как window.global_variable_name = foo
window.canvas;
window.current_graph;   //(под)граф, который в данный момент отрисовывается. не его имя
window.current_circle;  //
window.graphs;          //то,что мы получили после того, как распарсили JSON

function init()
{
  var w = window,
  d = document,
  e = d.documentElement,
  g = d.body,
  x = w.innerWidth || e.clientWidth || g.clientWidth,
  y = w.innerHeight|| e.clientHeight|| g.clientHeight;

  canvas = document.getElementById("canvas")
  //setAttributeNS единственный кошерный метод для работы с SVG, так пишут в апаче(ссылка) и в w3schools.com http://www.w3schools.com/jsref/met_element_setattributens.asp - там написано, что этот метод не поддерживается в Internet Explorer =( 
  canvas.setAttributeNS(null,'width',x);
  canvas.setAttributeNS(null,'height',y);
  
  //построение JSON

  //json
  //имя графа, описание вершин, размер окружности, в которую вписывается граф
  //с g начинаются графы (подграфы)
  //чтобы не усугублять вложенностью, было решено подграфы писать на том же уровне, что и графы
  // поэтому мы строим только деревья. А то где на остальное распологать то, а?
  // Ок, стороим только деревья, с остальным потом разберёмся\придумаем
  json = '[\
  {\
    "graph_name":"g0",\
    "verticies":[\
      {"vertex_name":"1","radius":"10","adjacent_to":["2","3","4"]},\
      {"vertex_name":"2","radius":"10","adjacent_to":["1"]},\
      {"vertex_name":"3","radius":"10","adjacent_to":["1"]},\
      {"vertex_name":"4","radius":"10","adjacent_to":["1"]}\
    ]\
  }\
  ]';

  //построение изображения по JSON
  draw(json);
}


//отрисовка на канвасе
function draw(json)
{
  var
    w = 1,
    width = canvas.getAttribute("width"),
    height = canvas.getAttribute("height"),
    r = Math.min(parseInt(width),parseInt(height));
  
  // всеобъемлющий граф будем называть "g0" и рисовать сами. Он будет  включать в себя все круги или надграфы
  // это единственный круг, который является сам себе родителем
  //выделить это в отдельный класс? (пока что это просто глобальные переменные)
  
  //current_graph = "g0"; не катит, потому что текузего графа ещё нет, потому что мы не распознали json
  //текущий граф - не просто имя, но структура, из которой можно будет вытащить имя
  circle(width/2-w,height/2-w,r/2-2*w,w,"g0");
  current_circle = canvas.children.namedItem(current_graph);

  plot(json);
}

//рисуем круг радиуса r, центром cx,cy. Толщина линии - w. Name - имя круга
function circle (cx,cy,r,w,name) 
{
  var node = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  node.setAttributeNS(null,"cx",cx); 
  node.setAttributeNS(null,"cy",cy); 
  node.setAttributeNS(null,"r",r); 
  node.setAttributeNS(null,"name",name);
  //node.setAttribute("parent",current_graph);   //у всех кругов есть родитель
  //node.setAttribute("children",[]);            //и дети
  //может как-нибудь без этого? у нас всё-таки есть структура JSON, которую вообще можно глобальной сделать
  node.style.stroke = "#000"; //Set stroke colour
  node.style.strokeWidth = w; //Set stroke width
  node.style.fill = "#FFF";
  var element = document.getElementById('canvas');
  element.appendChild(node);
}

//построение всего графа
function plot(json)
{
  //сделаем его глобальным, целое дерево тут всё-таки. И не будем зато парться по поводу свойств кругов.
  //этого graphs должно быть достаточно
  graphs = JSON.parse(json);
  // !TODO 
  graphs.forEach(check_json);  
  //либо мы делаем проверку на то, что граф сначала указывается в списке смежностей, либо мы пишем
  //цикл так, чтобы он крутился, пока всё не будет построено и пропускаем эти мелочи
  graphs.forEach(plot_graph); 
} 

//проверка подграфа на то, что все имена уникальны
// 1) на уникальность имён вершин
// на заметку = значения радиусов нам к хуям не упёрлись, поэтому при проверке можно
// вообще тут два варианта 
// а) можно "нормировать" это, то есть, чтобы хотя бы число были поменьше 
// б) можно привести всё к интам, мб так лучше будет?)
// итог: можно реализовать оба метода и протестировать какой из них лучше работает, если вообще будет виден 
// прирост производительности
// итог2: для этого нужно написать отдельную хуйню с тестами
// нужен тест в глубину (супер дохуя вложений)
// тест в ширину
function check_json(graph)
{
  var dict = []
  for (var i = 0; i < graph.verticies.length; i++) {
    if (dict[graph.verticies[i].name]==null)
      dict.push(graph.verticies[i].name)
    else return 0; 
  };
  return 1; //ok
}

//построение одного подграфа
//т.е просто рисуем набор кругов, которые перечислены в списке вершин
//контур подграфа может быть уже построен, поэтому нужно проверить имена уже построенных кругов
//контур графа - круг, в который вписывается подграф
// если уже что-то есть, то строить внтури
function plot_graph(graph)
{
  current_graph = graph;
  current_circle = canvas.children.namedItem(current_graph.graph_name);

  //если объемлющего круга для графа нет, то current_graph не тот, что нам нужен
  if (canvas.children.namedItem(current_graph.graph_name) == null)
    return 0;
  var verticies = graph.verticies;
  //graph.drawn = [];
  //здесь цикл по всем вершинам только по предположению, что не все вершины смежны между собой, а следовательно
  //не до всех можно дойти из любой
  for (var i = 0; i < verticies.length; i++) {
    plot_vertex(verticies[i]);
  };

}

//построение вершины и вершин, смежных к ней
//нужно хранить где-то список построенных вершин и проверять, построены они или нет - за это отвечает текущий граф
//можно всё смотреть по нему
//вопрос - как и где строить первую вершину 
//ответ - в центре графа, точнее в центре круга с именем соответствующего графа
function plot_vertex(vertex)
{ 
  var cx = current_circle.getAttribute("cx");
  var cy = current_circle.getAttribute("cy");
  circle(cx,cy,vertex.radius,1,vertex.vertex_name);
  //current_circle.getAttribute("children").push(vertex); забили на это, это надо вытаскивать из graphs
  var verticies = vertex.adjacent_to;
  var phi = Math.pi * 2 / verticies.length;
  for (var i = 0; i < verticies.length; i++) 
  {
    if (!(verticies[i] in canvas.children)) //если ещё не нарисовано
    {  
      circle(cx + (vertex.radius + graph_name.verticies verticies[i])
      //current_circle.getAttribute("children").  push(verticies[i]);
    }
  }
}
