var element = document.getElementById("map");
var map;
var zoomParameter = 8;
var marker = [];
var lines = [];
var orden = 1;
var fileName = [];
var ultimaParadaSeleccionada = null ;

var arrParadasOrdenadas = [];
var arrLineasEntreParadas = [];
            
            
function initialize() 
{
                
    var mapTypeIds = [];
    
    mapTypeIds.push("GoogleRoadMaps");

    map = new google.maps.Map(element, {
        center: new google.maps.LatLng(-24.789270, -65.412508),
        zoom: 13,
        mapTypeId: "GoogleRoadMaps",
        mapTypeControlOptions: {
            mapTypeIds: mapTypeIds
        }
    });

    map.mapTypes.set("GoogleRoadMaps", new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {

            return "http://localhost/mapas_ciudades/salta/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "GoogleRoadMaps",
        maxZoom: 17
    }));
}
            
            
function getRecorrido(recorridoFile)
{
    var arrParadas = [];
    
    fileName = recorridoFile.split(".");
    var carpeta = fileName[0].substr(0,1);
//    alert("filename: "+carpeta);
    $.ajax({
        url: "http://localhost/Comollego/extras/recorridos/salta/saeta/"+carpeta+"/"+recorridoFile
    }).then(function(data) 
    {
        
        
        $(data).find("Folder").each(function()
        {
                var $folder = $(this);
                var folderName = $folder.find("name")[0].innerHTML;
                
                if ( folderName.trim().toUpperCase() == "PARADAS") 
                {
//                    var orden = 1;
                    $($folder).find("Placemark").each(function()
                    {
                        var parada = [];
                        
                        var $placemark = $(this);
                        
                        var nombre      = $placemark.find("name").text();
                        var descripcion = $placemark.find("description").text();
                        var point       = $placemark.find("Point");
                        
                        
                        var coordenadas = point.text();
                        
                        var latitud = parseFloat(coordenadas.split(",")[1]);
                        var longitud = parseFloat(coordenadas.split(",")[0]);
                        
                        console.log("latitud: "+latitud+" - Longitud: "+longitud);
                        parada['nombre'] = nombre;
                        parada['descripcion'] = descripcion;
                        parada['latitud']  = latitud;
                        parada['longitud'] = longitud;
//                        parada['orden']    = orden;
//                        orden++;
                        arrParadas.push(parada);
                    });
                } else {
                        console.log("No entramos por nombre de folder. (PARADAS != "+folderName.toUpperCase()+")");
                }
                
        });
        
//        cargarRecorridoMapa( arrParadas);
    });
    console.log("Saliendo de la funcion y retornando algo");
    return arrParadas;
}


function cargarRecorridoMapa(arrParadas)
{
    var posicionUltimoNodo = 0;
    
    for(key in arrParadas) 
    {
        var parada = arrParadas[key];
        var posicion = new google.maps.LatLng(parada['latitud'], parada['longitud']);
        
        var nMarker = addMarker(posicion, parada['nombre'], parada['descripcion']/*, parada['orden']*/);
        marker.push(nMarker);
        
//        if (posicionUltimoNodo != 0)
//        {
//            var nLine = addLine(posicion, posicionUltimoNodo);
//            lines.push(nLine);
//        }
        
        posicionUltimoNodo = posicion;
    }
}


function addMarker(posicion, nombre, descripcion/*, orden*/)
{
    var lineasInvolucradas = [];
    var oMarker = [];
    
    oMarker['orden']        = -10;
    oMarker['nombre']       = nombre;
    oMarker['descripcion']  = descripcion;
    oMarker['latitud']      = posicion.lat();
    oMarker['longitud']     = posicion.lng();
    oMarker['marker']       =  new google.maps.Marker({
        position: posicion,
        map: map,
        draggable:true,
        icon: "marker3.png"
    });
    
    oMarker['marker'].addListener('click', function() 
    {
//        setOrden(this);
//        this.setIcon("marker.png");
    });
    
    oMarker['marker'].addListener('rightclick', function() 
    {
        if (ultimaParadaSeleccionada != null)
        {
            if (!checkIfMarkerExistInArray(this, arrParadasOrdenadas))
            {
                addLine(ultimaParadaSeleccionada.position, this.position)
                arrParadasOrdenadas.push(this);
                ultimaParadaSeleccionada = this;s
            }
            else
                alert("La parada seleccionada ya fue utilizada anteriormente.");
        } else {
            ultimaParadaSeleccionada = this;
        }
    });
    
    oMarker['marker'].addListener('dragend', function(event) 
    {
        posicionFinal = this.getPosition();
        
        console.log("posicionFinalLatitud: "+posicionFinal.lat()+" -- posicionFinalLongitud: "+posicionFinal.lng());
        console.log("posicionInicialGuardadaLatitud: "+posicion.lat()+" -- posicionInicialGuardadaLongitud: "+posicion.lng());
        
        var posicionFinalMarker = new google.maps.LatLng(event.latLng.lat().toFixed(8), event.latLng.lng().toFixed(8))
        reDrawLines(posicion, posicionFinal, lineasInvolucradas);
        posicion = posicionFinal;
    });
    
    oMarker['marker'].addListener('dragstart', function(event) 
    {
        
        console.log("posicionOrigenLatitud: "+posicion.lat()+" -- posicionOrigenLongitud: "+posicion.lng());
        
        lineasInvolucradas = getLinesFromOrToMarker(posicion, lines);
        
        for(key in lineasInvolucradas) {
            console.log("key: "+key);
            lineasInvolucradas[key].setMap(null);
            lines[key] = lineasInvolucradas[key];
        }
    });
    
    return oMarker;
}

function exportarParadas()
{
    var aux;
    
    var xmlText = 
    "<?xml version='1.0' encoding='UTF-8'?>"+                
    "<kml xmlns='http://www.opengis.net/kml/2.2'>"+
    "<Folder>"+
        "<name>Paradas</name>";
        
    for(key = 0; key<arrParadasOrdenadas.length; key++) {
        xmlText += ""+
            "<Placemark>"+
				"<name>Marker "+key+"</name>"+
                "<descripcion>Marker "+key+"</descripcion>"+
                "<orden>"+key+"</orden>"+
				"<styleUrl>#icon-503-DB4436-nodesc</styleUrl>"+
				"<Point>"+
					"<coordinates>"+arrParadasOrdenadas[key].getPosition().lng()+","+arrParadasOrdenadas[key].getPosition().lat()+",0.0</coordinates>"+
				"</Point>"+
			"</Placemark>";
    }
    xmlText += ""+
    "</Folder></kml>";
    $("#textAreaXml").text(xmlText);
    var nombreArchivo = "1c_aaaaa.xml";
    $.ajax({
        url: "http://localhost/mapMaker/saveRecorrido.php",
        method: "POST", 
        data: {"data":xmlText, "fileName":nombreArchivo}
    }).then(function(data) 
    {
            alert("Guardado");
    });
//    var newWindow = window.opener(xmlText);
    
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlText,"text/xml");
    console.log(xmlDoc);
    
}


function checkIfMarkerExistInArray(markerToCheck, arrayToCheckin)
{
    for (key in marker)
    {
        if(arrayToCheckin[key] == markerToCheck)
            return true;
    }
    return false;
}


function setOrden(oMaker)
{
    for (key in marker)
    {
        if(marker[key]['marker'] == oMaker){
            if (marker[key]['orden'] < 0) {
                marker[key]['orden'] = orden;
                bubbleInfoLeftMenu(marker[key]['nombre'], marker[key]['descripcion'], marker[key]['orden'], marker[key]['latitud'], marker[key]['longitud']);
                orden = orden + 100;
                break;
            } else {
                bubbleInfoLeftMenu(marker[key]['nombre'], marker[key]['descripcion'], marker[key]['orden'], marker[key]['latitud'], marker[key]['longitud']);
            }
            console.log("orden: "+key);
        }
    }
}

function addLine(posicionInicial, posicionFinal)
{
    var path = [];
    path.push(posicionInicial);
    path.push(posicionFinal);
    var linea = new google.maps.Polyline({
        path: path,
        geodesic: true,
        map: map,
        title:""
    });
                
    linea.addListener('click', function () 
    {
        alert("click en la linea");
//         getPathVariableCode(linea);
    });
    
    return linea;
}


/**
 * Devuelve todas las lineas que tiene el origen o el final en las coordenadas pasadas como parametro
 **/
function getLinesFromOrToMarker(posicion, lines)
{
    var lineasInvolucradas = [];;
    var latitudOrigen;
    var longitudOrigen;
    var latitudDestino;
    var longitudDestino;
    
    for(key in lines) 
    {
        var pathArr = lines[key].getPath();
        
        latitudOrigen = pathArr.getAt(0).lat();
        longitudOrigen = pathArr.getAt(0).lng();
        latitudDestino = pathArr.getAt(1).lat();
        longitudDestino = pathArr.getAt(1).lng();
        
        if((posicion.lat() == latitudOrigen && posicion.lng() == longitudOrigen) || (posicion.lat() == latitudDestino && posicion.lng() == longitudDestino))
        {
//            console.log("latitudOrigen: "+latitudOrigen+" - longitudOrigen: "+longitudOrigen);
//            console.log("latitudDestino: "+latitudDestino+" - longitudDestino: "+longitudDestino);
//            console.log("--------------------"); 
            
            lineasInvolucradas[key] = (lines[key]);
        }
        
    }
    return lineasInvolucradas;
}
 /**
  * 
  **/
function reDrawLines(posicionOrigen, posicionDestino, lineas)
{
    for(key in lineas) 
    {
        console.log("key: "+key);
        var pathArr = lineas[key].getPath();
        var newPath = [];
        
         if(pathArr.getAt(0).lat() == posicionOrigen.lat() && pathArr.getAt(0).lng() == posicionOrigen.lng())
         {
             
             newPath.push(posicionDestino);
             newPath.push(pathArr.getAt(1));
             
             lineas[key].setPath(newPath);
             lineas[key].setMap(map);
         } else {
             newPath.push(posicionDestino);
             newPath.push(pathArr.getAt(0));
             
             lineas[key].setPath(newPath);
             lineas[key].setMap(map);
         }
         lines[key] = lineas[key];
    }
    
}
            
            
//funcion para eliminar del mapa todas las lineas y marcadores cargados.
function clearMap()
{
    for(key in marker) 
    {
        marker[key]['marker'].setMap(null); 

    }
    
    for(key in lines) 
    {
        lines[key]['marker'].setMap(null); 

    }
}


function exportDocument()
{
    var markerAux = marker;
    var aux;
    
    for(key = 0; key<=marker.length; key++) {
        for (key1 = 0; key1<=marker.length; key1++) {
//            console.log("key"+key1);
            if(marker[key1+1]) {
//                console.log("Entrmaos: "+key1);
                if(parseFloat(marker[key1]["orden"]) > parseFloat(marker[key1+1]["orden"])) {
                    aux = marker[key1];
                    marker[key1] = marker[key1+1];
                    marker[key1+1] = aux;
                } else {
//                    console.log(key1+"  - No entrmos: "+parseFloat(marker[key1]["orden"])+" --"+ parseFloat(marker[key1+1]["orden"]));
                }
            
            }
        }
    }
    
    var xmlText = 
    "<?xml version='1.0' encoding='UTF-8'?>"+                
    "<kml xmlns='http://www.opengis.net/kml/2.2'>"+
    "<Folder>"+
        "<name>Paradas</name>";
    for(key in marker) {
        xmlText += ""+
            "<Placemark>"+
				"<name>"+marker[key]['nombre']+"</name>"+
                "<descripcion>"+marker[key]['nombre']+"</descripcion>"+
                "<orden>"+marker[key]['orden']+"</orden>"+
				"<styleUrl>#icon-503-DB4436-nodesc</styleUrl>"+
				"<Point>"+
					"<coordinates>"+marker[key]['longitud']+","+marker[key]['latitud']+",0.0</coordinates>"+
				"</Point>"+
			"</Placemark>";
    }
    xmlText += ""+
    "</Folder></kml>";
    $("#textAreaXml").text(xmlText);
    var nombreArchivo = $("#fileName").val();
    $.ajax({
        url: "http://localhost/mapMaker/saveRecorrido.php",
        method: "POST", 
        data: {"data":xmlText, "fileName":nombreArchivo}
    }).then(function(data) 
    {
            alert("Guardado");
    });
//    var newWindow = window.opener(xmlText);
    
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlText,"text/xml");
    console.log(xmlDoc);
    return marker;
}

function bubbleInfoLeftMenu(nombre, descripcion, orden, latitud, longitud)
{
    var contentString = "<b>Nombre:</b> "+nombre+
                        "<br><b>Descripcion:</b> "+descripcion+
                        "<br><b>Orden:</b> <input type='text' value='"+orden+"'/><input type='button' id='btnUpdateParada' value='...'/>"+
                        "<br><b>Latitud:</b> "+latitud+
                        "<br><b>Longitud:</b> "+longitud;
    contentString += "<br><br><input type='text' value='"+fileName[0]+"_back."+fileName[1]+"' placeholder='Nombre del Archivo a crear' id='fileName'></input>";
    contentString += "<br><input type='button' value='Export' onClick=exportDocument()></input>";
                        
    $("#notificacionSector").html(contentString);
}