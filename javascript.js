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
  draw(canvas);
}


//отрисовка на канвасе
function draw(canvas)
{
  w = 2; 
  width = canvas.getAttribute("width");
  height = canvas.getAttribute("height");
  r = Math.min(width,height);
  circle(width/2-w,height/2-w,r/2-2*w,w);
  //json
  //имя графа, описание вершин, размер окружности, в которую вписывается граф
  //с g начинаются графы (подграфы)
  json = '[\
  {\
    "graph_name":"g0",\
    "verticies":[\
      {"vertex_name":"1","radius":"4","adjacent_to":["2","3","4"]},\
      {"vertex_name":"2","radius":"4","adjacent_to":["1"]},\
      {"vertex_name":"3","radius":"4","adjacent_to":["1"]},\
      {"vertex_name":"4","radius":"4","adjacent_to":["1"]}\
    ]\
  }\
  ]';
  plot(json);
}

//рисуем круг радиуса r, центром cx,cy. Толщина линии - w
function circle (cx,cy,r,w) {
  var node = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  node.setAttributeNS(null,"cx",cx); 
  node.setAttributeNS(null,"cy",cy); 
  node.setAttributeNS(null,"r",r); 
  node.style.stroke = "#000"; //Set stroke colour
  node.style.strokeWidth = w; //Set stroke width
  node.style.fill = "#FFF";
  var element = document.getElementById('canvas');
  element.appendChild(node);
}

//построение всего графа
function plot(json)
{
  graphs = JSON.parse(json);
  graphs.forEach(check_json);  
  graphs.forEach(plot_graph); 
} 

//проверка подграфа на то, что все имена уникальны
// 1) на уникальность имён вершин
function check_json(graph)
{
  dict = []
  for (var i = 0; i < graph.verticies.length; i++) {
    if (dict[graph.verticies[i].name]==null)
      dict.push(graph.verticies[i].name)
    else return 0; 
  };
  return 1; //ok
}

//построение одного подграфа
function plot_graph(graph)
{
  verticies = graph.verticies;
  graph.drawn = [];
  for (var i = 0; i < verticies.length; i++) {
    plot_vertex(verticies[i],graph);
    
  };

}

//построение вершины и вершин, смежных к ней
//нужно хранить где-то список построенных вершин и проверять, построены они или нет
function plot_vertex(vertex,graph)
{ 
  for (var i = 0; i < graph.verticies.length; i++) {
  }
  graph.drawn.push(verticies[i].vertex_name);
}