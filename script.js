var arrMarkers  = [];
var arrLines    = [];


  
function openXMLBusTravel(fileName, bMostrarRecorrido)
{
    var arrFileName = [];
    
    arrFileName = fileName.split(".");
    var carpeta = arrFileName[0].substr(0,1);
    
    console.log("fileName: "+fileName);
    
    $.ajax({
        url: "http://localhost/Comollego/extras/recorridos/salta/saeta/"+carpeta+"/"+arrFileName[0]+"."+arrFileName[1],
        success: function(data) 
        {
            var arrParadas = loadBusStopFromXML(data);
            cargarRecorridoMapa(arrParadas);
            
            if (bMostrarRecorrido)
                mostrarLineasEntreParadas(arrParadas);
//        cargarRecorridoMapa( arrParadas);
        }
    });
        
    console.log("Saliendo de la funcion y retornando algo");
    
}

function loadBusStopFromXML(xmlBusStopFormat)
{
    var arrParadas = [];
    
    $(xmlBusStopFormat).find("Folder").each(function()
    {
        var $folder = $(this);
        var folderName = $folder.find("name")[0].innerHTML;
        
        if ( folderName.trim().toUpperCase().search("PARADAS") >= 0) 
        {
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
                
                arrParadas.push(parada);
            });
        } else {
                console.log("No entramos por nombre de folder. (PARADAS != "+folderName.toUpperCase()+")");
        }
            
    });
    
    return arrParadas;
} 

function mostrarLineasEntreParadas(arrParadas)
{
    var bPrimero = true;
    var oUltimaParada = null;
    
    for(key in arrParadas) 
    {
        var parada = arrParadas[key];
        var posicionActual = new google.maps.LatLng(parada['latitud'], parada['longitud']);
        
        
        if (bPrimero == false)
        {
            console.log("Parada: lat "+parada['latitud']+" - Lng "+parada['longitud']);
            console.log("oUltimaParada: lat "+oUltimaParada['latitud']+" - Lng "+oUltimaParada['longitud']);
            var path = [
              {lat: parada['latitud'], lng: parada['longitud']},
              {lat: oUltimaParada['latitud'], lng: oUltimaParada['longitud']}
            ];
        
            var line = new google.maps.Polyline({
                path: path,
                geodesic: true,
                map: map,
                title:"",
                strokeWeight: 6
            });
        }
        
        oUltimaParada = parada;
        bPrimero = false;
    }
    
}

function cargarRecorridoMapa(arrParadas)
{
    for(key in arrParadas) 
    {
        var parada = arrParadas[key];
        var posicion = new google.maps.LatLng(parada['latitud'], parada['longitud']);
        
        var nMarker = createNewMarker(posicion, parada['nombre'], parada['descripcion']/*, parada['orden']*/);
        arrMarkers.push(nMarker);
        
//        if (posicionUltimoNodo != 0)
//        {
//            var nLine = addLine(posicion, posicionUltimoNodo);
//            lines.push(nLine);
//        }
    }
}



function exportarParadas()
{
    var aux = oPrimeraParada;
    
    var xmlText = 
    "<?xml version='1.0' encoding='UTF-8'?>"+                
    "<kml xmlns='http://www.opengis.net/kml/2.2'>"+
    "<Folder>"+
        "<name>Paradas</name>";
        
    //for(key = 0; key<arrParadasOrdenadas.length; key++) {
    while (aux != null) {
        xmlText += ""+
            "<Placemark>"+
				"<name>Marker "+aux["nombre"]+"</name>"+
                "<descripcion>Marker descripcion</descripcion>"+
                "<orden>"+aux["orden"]+"</orden>"+
				"<styleUrl>#icon-503-DB4436-nodesc</styleUrl>"+
				"<Point>"+
					"<coordinates>"+aux["longitud"]+","+aux["latitud"]+",0.0</coordinates>"+
				"</Point>"+
			"</Placemark>";
            
            aux = aux["to"];
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
    for (key in arrMarkers)
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
    for(key in arrMarkers) 
    {
        arrMarkers[key]['marker'].setMap(null); 

    }
    
    for(key in arrLines) 
    {
        arrLines[key]['marker'].setMap(null); 

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