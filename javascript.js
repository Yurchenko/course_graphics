//инициализация всего и вся
//обработка входных данных - ???
//отрисовка - draw 
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

  //построение изображения по JSON
  draw();
}


//отрисовка на канвасе
function draw()
{
  var w = 1; 
  var width = canvas.getAttribute("width");
  var height = canvas.getAttribute("height");
  var r = Math.min(width,height);
  
  // всеобъемлющий граф будем называть "g0" и рисовать сами. Он будет  включать в себя все круги или надграфы
  // соответственно обязательным пунктом в проверке JSON на валидность, будет проверка на то, что имя графа
  // это единственный круг, который является сам себе родителем
  current_graph = "g0"
  circle(width/2-w,height/2-w,r/2-2*w,w,"g0");

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
      {"vertex_name":"1","radius":"1","adjacent_to":["2","3","4"]},\
      {"vertex_name":"2","radius":"1","adjacent_to":["1"]},\
      {"vertex_name":"3","radius":"1","adjacent_to":["1"]},\
      {"vertex_name":"4","radius":"1","adjacent_to":["1"]}\
    ]\
  }\
  ]';

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
  node.setAttributeNS(null,"parent",current_graph); 
  node.style.stroke = "#000"; //Set stroke colour
  node.style.strokeWidth = w; //Set stroke width
  node.style.fill = "#FFF";
  var element = document.getElementById('canvas');
  element.appendChild(node);
}

//построение всего графа
function plot(json)
{
  var graphs = JSON.parse(json);
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
//контур подграфа может быть уже построен, поэтому нужно проверить имена уже построенных кругов
//контур графа - круг, в который вписывается подграф
// если уже что-то есть, то строить внтури
function plot_graph(graph)
{

  var verticies = graph.verticies;
  graph.drawn = [];
  for (var i = 0; i < verticies.length; i++) {
    plot_vertex(verticies[i],graph);    
  };

}

//построение вершины и вершин, смежных к ней
//нужно хранить где-то список построенных вершин и проверять, построены они или нет
function plot_vertex(vertex,graph)
{ 
  var verticies = vertex.adjacent_to;
  for (var i = 0; i < verticies.length; i++) 
  {
    if (!(verticies[i] in graph.drawn))
    {  
      graph.drawn.push(verticies[i]);
    }
  }
}
