//инициализация всего и вся
//обработка входных данных - ???
//отрисовка - draw

//глобальные переменные
//говорят, в яваскрипте их нужно объявлять как window.global_variable_name = foo
window.canvas;
window.current_graph;   //(под)граф, который в данный момент отрисовывается. не его имя
window.current_circle;  //
window.graphs;          //то,что мы получили после того, как распарсили JSON
window.files;           //файлы

function handleFileSelect(evt) 
{
  files = evt.target.files; // FileList object

  // files is a FileList of File objects. List some properties.
  var output = [];
  for (var i = 0, f; f = files[i]; i++) {
    output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                f.size, ' bytes, last modified: ',
                f.lastModifiedDate.toLocaleDateString(), '</li>');
  }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function init()
{
  if (window.File && window.FileReader && window.FileList && window.Blob) 
  {
    document.getElementById('files').addEventListener('change', handleFileSelect, false);
  } 
  else 
  {
    alert('The File APIs are not fully supported in this browser.');
  }


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
      {"vertex_name":"1","radius":"55","adjacent_to":["2","3","4","6"]},\
      {"vertex_name":"2","radius":"20","adjacent_to":["1","3","5"]},\
      {"vertex_name":"3","radius":"20","adjacent_to":["1","2","4","5"]},\
      {"vertex_name":"4","radius":"20","adjacent_to":["1","3","6","7","8"]},\
      {"vertex_name":"5","radius":"80","adjacent_to":["2","3"]},\
      {"vertex_name":"6","radius":"30","adjacent_to":["1","4","7"]},\
      {"vertex_name":"7","radius":"20","adjacent_to":["4","6","8","9"]},\
      {"vertex_name":"8","radius":"20","adjacent_to":["4","7","9"]},\
      {"vertex_name":"9","radius":"15","adjacent_to":["7","8"]}\
    ]\
  },\
  {\
    "graph_name":"g5",\
    "verticies":[\
      {"vertex_name":"1","radius":"100","adjacent_to":["2","3"]},\
      {"vertex_name":"2","radius":"100","adjacent_to":["1","3"]},\
      {"vertex_name":"3","radius":"100","adjacent_to":["1","2"]}\
    ]\
  }\
  ]';

  json1 = '[\
  {\
    "graph_name":"g0",\
    "verticies":[\
      {"vertex_name":"1","radius":"100","adjacent_to":["2","3"]},\
      {"vertex_name":"2","radius":"100","adjacent_to":["1","3"]},\
      {"vertex_name":"3","radius":"100","adjacent_to":["1","2"]}\
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
  //выделить это в отдельный класс? (пока что это просто глобальные переменные)

  //current_graph = "g0"; не катит, потому что текузего графа ещё нет, потому что мы не распознали json
  //текущий граф - не просто имя, но структура, из которой можно будет вытащить имя
  circle(width/2,height/2,r/2,w,"g0","canvas");
  current_circle = canvas.children.namedItem("g0");

  plot(json);
}

//рисуем круг радиуса r, центром cx,cy. Толщина линии - w. Name - имя круга
//рисуем круг так, чтобы радиус был действительно радиусом, а толщина обводки бралась из внутренней части круга, т.е от неё не зависит видимый радиус
function circle (cx,cy,r,w,name,parent)
{
  if (parent==undefined)
    parent = current_circle.getAttribute("name");
  
  var node = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  node.setAttributeNS(null,"cx",cx);
  node.setAttributeNS(null,"cy",cy);
  node.setAttributeNS(null,"r",r-w/2);
  node.setAttributeNS(null,"name",name);
  node.setAttributeNS(null,"onclick","alert('click')");
  node.setAttributeNS(null,"parent",parent);   //у всех кругов есть родитель
  //node.setAttribute("children",[]);            //и дети
  //может как-нибудь без этого? у нас всё-таки есть структура JSON, которую вообще можно глобальной сделать
  
  if (name=="g0")
  {
    node.setAttributeNS(null,"width","100%");
    node.style.stroke = "#FFF"; //Set stroke colour
        //node.setAttributeNS(null,"height",r*2);
    //node.setAttributeNS(null,"viewBox","0 0 100 100");
  }
 
    
  //node.style.stroke = "#000"; //Set stroke colour
  //node.style.strokeWidth = w; //Set stroke width
  //node.style.fill = "#FFF";

  // node.setAttribute('transform','scale(1.5,1.5)');
  //var element = document.getElementById('canvas');
  
  canvas.appendChild(node);

  if (name[0]!="g")
    draw_text(cx,cy,name,node);

  //нарисуем в центре название
  
}

//draw text 
function draw_text(x,y,string,parent)
{ 
  var newText = document.createElementNS("http://www.w3.org/2000/svg","text");
  newText.setAttributeNS(null,"x",x);     
  newText.setAttributeNS(null,"y",y); 
  //newText.setAttributeNS(null,"font-size","11");
  newText.setAttributeNS(null,"textLength",r(parent));
  //newText.setAttributeNS(null,"lengthAdjust","spacingAndGlyphs");
  //newText.setAttributeNS(null,"parent",parent);
  var textNode = document.createTextNode(string);
  newText.appendChild(textNode);
  canvas.appendChild(newText);
}

//построение всего графа
function plot(json)
{
  //сделаем его глобальным, целое дерево тут всё-таки. И не будем зато парться по поводу свойств кругов.
  //этого graphs должно быть достаточно
  graphs = JSON.parse(json);

  // !TODO
  if (graphs.every(check_json))
  {
    //wow cool
  }
  else
  {
    //что не так?
    //не триангулированный?
    //куда выводим ошибки?
  }
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
//проверка на то, что граф триангулирован
//вообще придумать перевод логичный из нетриангулированного в триангулированныый
function check_json(graph)
{
  var dict = []
  for (var i = 0; i < graph.verticies.length; i++) {
    if (dict[graph.verticies[i].name]==null)
      dict.push(graph.verticies[i].name)
    else return 0;
  };

  //здесь должна быть проверка на триангуляцию. 
  graph.triangulated = true;


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

  //если граф триангулированный
  if (graph.triangulated)
  {  
    plot_triangulated(graph);
    return;
  }
  //else

  //если объемлющего круга для графа нет, то current_graph не тот, что нам нужен
  if (canvas.children.namedItem(current_graph.graph_name) == null)
    return 0;
  var verticies = graph.verticies;

  //graph.drawn = [];
  //здесь цикл по всем вершинам только по предположению, что не все вершины смежны между собой, а следовательно
  //не до всех можно дойти из любой
  //for (var i = 0; i < verticies.length; i++) {
  //  plot_vertex(verticies[i]);
  //};

  //вообще, после того, как все вершины построены, нужно сделать так, чтобы они занимали как можно больше места внутри круга, выделенного под граф

}

//построение вершины и вершин, смежных к ней
//нужно хранить где-то список построенных вершин и проверять, построены они или нет - за это отвечает текущий граф
//можно всё смотреть по нему
//вопрос - как и где строить первую вершину
//ответ - в центре графа, точнее в центре круга с именем соответствующего графа
function plot_vertex(vertex)
{
  //проверка на то, нарисована ли уже вершина
  if (canvas.children.includes(vertex))
    return;
  //придумывать как заисывать в логи, это будет выполняться скорее всего с помощью локального хранилища
  //есть такое API в HTML5  
  var cx = current_circle.getAttribute("cx");
  var cy = current_circle.getAttribute("cy");
  //смотрим на соседей - если ни один не нарисован, то рисуем себя в центре
  //мы так можем сделать, потому что граф триангулированный
  var verticies = vertex.adjacent_to;
  var drawn_neighboors = [];
  for (var i = 0; i < verticies.length; i++) {
    if (canvas.children.includes(verticies[i]))
      drawn_neighboors.push(verticies[i]);
  };
  //если не нарисованы
  if (drawn_neighboors.length == 0)
    circle(cx,cy,vertex.radius,1,vertex.vertex_name);
  //если нарисованы
  else
  {
    //если нарисован один - рисуем себя над ним
    if (drawn_neighboors.length == 1)
    {
      var b_vertex = canvas.children.namedItem(drawn_neighboors[0]); 
      var x = b_vertex.getAttribute("cx");
      var y = b_vertex.getAttribute("cy");
      var r = parseFloat(b_vertex.getAttribute("r")) + parseFloat(b_vertex.style.strokeWidth)/2; 
      circle(x, y - r - vertex.radius, vertex.radius, 1, vertex.vertex_name) 
    }
    //2+ соседей - вписываем себя между любыми двумя
    else
    {

    }

  }

  //current_circle.getAttribute("children").push(vertex); забили на это, это надо вытаскивать из graphs
  
  var phi = Math.pi * 2 / verticies.length;
  for (var i = 0; i < verticies.length; i++)
  {
    if (!(canvas.children.includes(verticies[i]))) //если ещё не нарисовано
    {
      //circle(cx + (vertex.radius + graph_name.verticies verticies[i])
      //current_circle.getAttribute("children").  push(verticies[i]);
    }
    else
    {

    }
  }
}

function plot_triangulated(graph)
{
  //первую вершину рисуем в центре
  var cx = current_circle.getAttribute("cx");
  var cy = current_circle.getAttribute("cy");
  var verticies = current_graph.verticies;  
  var first = verticies[0];
  circle(cx,cy,first.radius,1,first.vertex_name);
  //вторую вершину ровно на первой
  var second = find_vertex(first.adjacent_to[0]) /*current_graph.verticies.find(function find_second(vertex)
    {
      return vertex.vertex_name == first.adjacent_to[0];
    }) */
  circle(cx,cy-first.radius-second.radius,second.radius,1,second.vertex_name);

  //для каждой вершины, начиная с первой, рисуем всех её соседей
  plot_vertex_t(first);
  
  //fit_parent_size(graph);

  //нарисуем в центре название каждой вершины
  /*for (var i = verticies.length - 1; i >= 0; i--) {
    verticies[i]
  };*/
  draw_text(cx,cy,name,canvas.children.namedItem(first.vertex_name));
}

//нарисовать, смежную к двум вершинам first и second, третью  окружность с именем third
//формулы все выводил , так что вставляем смело в курсач, хотя они и неложные
function draw_neighboor(first,second,third)
{
  var 
  vertex1 = canvas.children.namedItem(first.vertex_name),
  vertex2 = canvas.children.namedItem(second.vertex_name),
  vertex3 = find_vertex(third);
  /*graph.verticies.find(function find_third(vertex)
  {
    return vertex.vertex_name == third;
  }),*/
  x1 = parseFloat(vertex1.getAttribute("cx")),
  y1 = parseFloat(vertex1.getAttribute("cy")),
  r1 = parseFloat(first.radius);
  x2 = parseFloat(vertex2.getAttribute("cx")),
  y2 = parseFloat(vertex2.getAttribute("cy")),
  r2 = parseFloat(second.radius),
  r3 = parseFloat(vertex3.radius),
  //сначала вычислим координаты, принимая x1y1 за точку отсчёта
  b = r1 + r3,
  a = r2 + r3,
  c = r1 + r2,
  x = (b*b + c*c - a*a) / (2*c),
  
  //т.к мы здесь вычисляем корень, то нам важно знать, с правильной ли мы стороны рисуем
  y = Math.sqrt(b*b - x*x),
  sina = (y2 - y1)/(r2+r1),
  cosa = (x2 - x1)/(r2+r1),
  //потом переведём в текущую систему координат
  x3 = x * cosa - y * sina + x1,
  y3 = x * sina + y * cosa + y1;

  //для проверки того, с правильной стороны ли мы рисуем, посмотрим, есть ли у нас ещё один, уже нарисованный, общий сосед

  var zero =  null;

  for (var i = 0; i < first.adjacent_to.length; i++) {
    for (var j = 0; j < second.adjacent_to.length; j++) {
      var s = second.adjacent_to[j];
      if ((s==first.adjacent_to[i]) && (s!=third) && canvas.children.namedItem(s)!=null)
      {
        zero = canvas.children.namedItem(s);
        break;
      }
    }; 
    if (zero!=null)
      break;
  }; 

  if (zero!=null)
  {
    //проверяем, по одну или по разные стороны лежат эти два соседа
    var x0 = parseFloat(zero.getAttribute("cx"));
    var y0 = parseFloat(zero.getAttribute("cy"));

    var o = ((x1-x2)*(y3-y2)-(x3-x2)*(y1-y2)) * ((x1-x2)*(y0-y2)-(x0-x2)*(y1-y2))

    //если эти вершины лежат по одну сторону, то надо рисовать 3ю вершину с другой стороны => перерисовываем
    if (o > 0)
    {
      x3 = x * cosa + y * sina + x1,
      y3 = x * sina - y * cosa + y1;

      circle(x3,y3,r3,1,third);
      return;
    }

  }
  
  circle(x3,y3,r3,1,third);
  
}

//plot vertex triangulate version 
// не рисует текущую вершину, подразумевается, что vertex уже нарисован
function plot_vertex_t(vertex)
{
  var verticies = vertex.adjacent_to;

  //ищем нарисованных соседей
  var drawn = verticies.filter(function find_second(v)
  {
    return canvas.children.namedItem(v) != null;
  })

  //ищем ненарисованных соседей
  var not_drawn = verticies.filter(function find_second(v)
  {
    return canvas.children.namedItem(v) == null;
  }) 

  //нечего рисовать - выходим из рекурсии!
  if (not_drawn.length == 0)
    return

  //смотрим с конца из drawn (он последний нарисованный) соседей из not_drawn

  var exit = false;

  while (not_drawn.length != 0)
  {
    for (var i = drawn.length-1; i >= 0; i--) {
      for (var j = 0; j < not_drawn.length; j++) {
        if (is_neighboor(drawn[i],not_drawn[j]))
        {
          draw_neighboor(vertex,find_vertex(drawn[i]),not_drawn[j])
          drawn.push(not_drawn[j]);
          not_drawn.splice(j,1);
          exit = true;
          break;
        }
      }
      if (exit) break;
    }
  }

  verticies = verticies.map(find_vertex);

  verticies.forEach(plot_vertex_t);

  
  
  //получаем словарь {нарисованная вершина : вершины, которые надо нарисовать}
  /*var neighboors = {};
  for (var i = 0; i < drawn.length; i++) {
    var vert = find_vertex(drawn[i]);
    for (var j = 0; j < vert.adjacent_to.length; i++) {
      if (!(vert.adjacent_to[j] in neighboors) && (vert.adjacent_to[j] in vertex.adjacent_to))
      {
        neighboors[drawn[i]].push(vert.adjacent_to[i]);
    };
  };*/


  //находим пересечение списка соседей нарисованных вершин и ненарисованных
  //рисуем, пока этот список не станет пустым
  //var to_draw = 


  //и рисуем их, пока все они не нарисуются!
  /*var left_to_draw = not_drawn.length;
  while(left_to_draw > 0)
  {
    for (var i = 0; i < not_drawn.length; i++) {
      //если сосед ненарисованной вершины, не равен vertex, но нарисован, то мы можем нарисовать
      if .verticies.find(function find_third(vertex)
      {graph
        return vertex.vertex_name == third;
      }),
    };
  }*/

  //draw_neighboor(graph,first,second,"3");
}

//ищем вершину по имени
function find_vertex(name)
{
  return current_graph.verticies.find(function find_second(v)
  {
    return v.vertex_name == name;
  })
}

//являются ли в графе current_graph врешины vertex1 и vertex2 соседними
//Array.prototype.includes() - экспериментальная технология, которая используетс только в стандарте ECMAScript 7
function is_neighboor(v1,v2)
{
  var vertex1 = find_vertex(v1);
  var vertex2 = find_vertex(v2);
  if (vertex1.adjacent_to.length>vertex2.adjacent_to.length)
  {
    if (vertex2.adjacent_to.includes(vertex1.vertex_name))
      return true
    else 
      return false
  }
  else
  {
    if (vertex1.adjacent_to.includes(vertex2.vertex_name))
      return true
    else 
      return false
  }
}

//чтобы внутренности наросованного растянулись\сузилось в соответствии с размером, куда это всё вписано
function fit_parent_size(graph)
{
  //нам нужно найти два максимально удалённых друг от друга шара из тех, шаров, родителем которых является graph

  //щито поделать - обычный перебор
  var arr = [].slice.call(canvas.children);
  var circles = arr.filter(function f(v)
  {
    return v.getAttribute("parent") == graph.graph_name;
  })
   

  //нет, просто ищем самый правый, левый, верхний нижний

  var 
  cx = parseFloat(current_circle.getAttributeNS(null,"cx")),
  cy = parseFloat(current_circle.getAttributeNS(null,"cy")),
  cr = parseFloat(current_circle.getAttributeNS(null,"r"));

  var
    x_min = parseFloat(circles[0].getAttributeNS(null,"cx"))+parseFloat(circles[0].getAttributeNS(null,"r")),
    y_min = parseFloat(circles[0].getAttributeNS(null,"cy"))+parseFloat(circles[0].getAttributeNS(null,"r")),
    x_max = parseFloat(circles[0].getAttributeNS(null,"cx"))-parseFloat(circles[0].getAttributeNS(null,"r")),
    y_max = parseFloat(circles[0].getAttributeNS(null,"cy"))-parseFloat(circles[0].getAttributeNS(null,"r"));

  for (var i = 0; i < circles.length; i++) {
    var 
    x = parseFloat(circles[i].getAttributeNS(null,"cx")),
    y = parseFloat(circles[i].getAttributeNS(null,"cy")),
    r = parseFloat(circles[i].getAttributeNS(null,"r"));
    if (x-r<x_min)
      x_min = x-r;
    if (x+r>x_max)
      x_max = x+r;
    if (y-r<y_min)
      y_min = y-r;
    if (y+r>y_max)
      y_max = y+r;
  }  

  canvas.setAttributeNS(null,"viewBox"," "+x_min+" "+y_min+" "+(x_max-x_min)+" "+(y_max-y_min)+" ");
  
  for (var i = 0; i < circles.length; i++) {
    circles[i].style.strokeWidth = 1;
  };

  //draw_text(circles[0].getAttributeNS(null,"cx"),circles[0].getAttributeNS(null,"cy"),circles[0].name,current_graph.graph_name)

  return;
/*
  var 
    new_cx = (x_max+x_min)/2,
    new_cy = (y_max+y_min)/2,
    new_r = Math.max((x_max-x_min)/2,(y_max-y_min)/2);
*/

  //радиус, который можно описать вокруг наших вершин это (max+2)/2
  //2 добавляется изза толщины обводки, она всегда 1

  //итак cx и cy - новые координаты центра. Мы должны сместить всё на разницу между центрами и увеличить на отношение между радиусами
/*
  var scale = cr/new_r;



  for (var i = 0; i < circles.length; i++) {
    var 
      x = parseFloat( circles[i].getAttributeNS(null,"cx")), 
      y = parseFloat( circles[i].getAttributeNS(null,"cy"));
    // сначала вернём на 0,0
    //circles[i].setAttributeNS(null,"cx",-x);
    //circles[i].setAttributeNS(null,"cy",-y);
    var transform = ""; 
    transform += "translate("+(cx-new_cx)+","+(cy-new_cy)+")";
    //transform += "scale(" + scale + ")";
    circles[i].setAttributeNS(null,"transform",transform);

    //circles[i].setAttributeNS(null,"cx",cx-new_cx);
    //circles[i].setAttributeNS(null,"cy",cy-new_cy);
    //transform += "translate("+(g_cx-cx)*scale+","+(g_cy-cy)*scale+") ";
    //transform += "translate("+((cx)/scale)+","+(cy/scale)+")";
    
    //circles[i].style.strokeWidth = 1/scale;

    // потом отмасштабируем
    //circles[i].setAttributeNS(null,"transform",scale);
    // потом передвинем обратно
    //circles[i].setAttributeNS(null,"transform","translate("+x+","+y+")");
    //и сдвинем туда, куда нам нужно
    //circles[i].setAttributeNS(null,"transform",translate);
    //canvas.appendChild(circles[i]);
};
  */
}

function distance(v1,v2)
{
  return Math.sqrt(Math.pow(parseFloat(v1.getAttribute("cx"))-parseFloat(v2.getAttribute("cx")),2)+Math.pow(parseFloat(v1.getAttribute("cy"))-parseFloat(v2.getAttribute("cy")),2))+parseFloat(v1.getAttribute("r"))+parseFloat(v2.getAttribute("r"));
}

function cx(object)
{
  return parseFloat(object.getAttributeNS(null,"cx"));
}

function cy(object)
{
  return parseFloat(object.getAttributeNS(null,"cy"));
}

function r(object)
{
  return parseFloat(object.getAttributeNS(null,"r"));
}