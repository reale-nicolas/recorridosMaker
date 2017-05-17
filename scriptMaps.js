var element = document.getElementById("map");
var map;
var zoomParameter = 8;


var fileName = [];

var arrParadasOrdenadas = [];
var arrLineasEntreParadas = [];

var oUltimaParada   = null;
var oPrimeraParada  = null;
var bPrimeraParada  = true;

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

function getMarkerByObjMarker(oMarker)
{
    for (key in arrMarkers)
    {
        if (arrMarkers[key]['marker'] == oMarker) {
            return arrMarkers[key];
        }
    }
    
    return false;
}

function getLineByObjLine(oLine)
{
    for (key in arrLines)
    {
        if (arrLines[key]['line'] == oLine) {
            return arrLines[key];
        }
    }
    
    return false;
}

function createNewMarker(posicion, nombre, descripcion/*, orden*/)
{
    var lineasInvolucradas = [];
    var oMarker = [];
    
    oMarker['orden']        = -10;
    oMarker['nombre']       = nombre;
    oMarker['descripcion']  = descripcion;
    oMarker['latitud']      = posicion.lat();
    oMarker['longitud']     = posicion.lng();
    oMarker['from']         = null;
    oMarker['to']           = null;
    oMarker['marker']       =  new google.maps.Marker({
        position: posicion,
        map: map,
        draggable:true,
        icon: "marker3.png"
    });
    
    oMarker['marker'].addListener('click', function() 
    {
        var auxOMaker = getMarkerByObjMarker(this);
        
        if (bPrimeraParada) 
        {
            bPrimeraParada = false;
            oPrimeraParada = auxOMaker;
            oUltimaParada  = oPrimeraParada;
        }
        else 
        {
            if (  auxOMaker["from"] == null && oUltimaParada["to"] == null)
            {
                auxOMaker["from"] = oUltimaParada;
                oUltimaParada["to"] = auxOMaker;
            
                var line = createNewLine(oUltimaParada, auxOMaker);
                arrLines.push(line);
                oUltimaParada  = auxOMaker;
            } 
            else if (auxOMaker["to"] == null) 
            {
                oUltimaParada = auxOMaker;
            } 
            else {
                if (auxOMaker["from"] == null)
                    alert("La parada de origen ya ha sido utilizada.");
                else
                    alert("La parada destino ya ha sido utilizada.");
                    
            }
        }
        console.log(auxOMaker);
//        if (ultimaParadaSeleccionada != null)
//        {
//            var auxMarker = getMarkerByObjMarker(this);
//            var auxUltimaParadaSeleccionada = getMarkerByObjMarker(ultimaParadaSeleccionada);
//            
//            if (!checkIfMarkerExistInArray(this, arrParadasOrdenadas))
//            {
//                var line = createNewLine(ultimaParadaSeleccionada, this);
//                lines.push(line);
//                arrParadasOrdenadas.push(this);
//                
//                auxMarker['from'] = auxUltimaParadaSeleccionada;
//                auxUltimaParadaSeleccionada['to'] = auxMarker;
//                ultimaParadaSeleccionada = this;
//                
//                console.log(getMarkerByObjMarker(this));
//            }
//            else
//                alert("La parada seleccionada ya fue utilizada anteriormente.");
//        } else {
//            arrParadasOrdenadas.push(this);
//            ultimaParadaSeleccionada = this;
//            primeraParadaSeleccionada = getMarkerByObjMarker(this);
//        }

    });
    
    oMarker['marker'].addListener('rightclick', function() 
    {
//        setOrden(this);
//        this.setIcon("marker.png");
    });
    
//    oMarker['marker'].addListener('dragend', function(event) 
//    {
//        posicionFinal = this.getPosition();
//        
//        console.log("posicionFinalLatitud: "+posicionFinal.lat()+" -- posicionFinalLongitud: "+posicionFinal.lng());
//        console.log("posicionInicialGuardadaLatitud: "+posicion.lat()+" -- posicionInicialGuardadaLongitud: "+posicion.lng());
//        
//        var posicionFinalMarker = new google.maps.LatLng(event.latLng.lat().toFixed(8), event.latLng.lng().toFixed(8))
//        reDrawLines(posicion, posicionFinal, lineasInvolucradas);
//        posicion = posicionFinal;
//    });
//    
//    oMarker['marker'].addListener('dragstart', function(event) 
//    {
//        
//        console.log("posicionOrigenLatitud: "+posicion.lat()+" -- posicionOrigenLongitud: "+posicion.lng());
//        
//        lineasInvolucradas = getLinesFromOrToMarker(posicion, lines);
//        
//        for(key in lineasInvolucradas) {
//            console.log("key: "+key);
//            lineasInvolucradas[key].setMap(null);
//            lines[key] = lineasInvolucradas[key];
//        }
//    });
    
    return oMarker;
}


function createNewLine(oMarkerFrom, oMarkerTo)
{
    var oLine = [];
    var path  = [];
    
    path.push(oMarkerFrom["marker"].position);
    path.push(oMarkerTo["marker"].position);
        
    oLine['from']        = oMarkerFrom;
    oLine['to']          = oMarkerTo;
    oLine['line']        = new google.maps.Polyline({
        path: path,
        geodesic: true,
        map: map,
        title:"",
        strokeWeight: 6
    });
                
    oLine['line'].addListener('click', function () 
    {
        var auxLine = getLineByObjLine(this);
        
        //if (confirm("Seguro desea eliminar la linea seleccionada?"))
        {
            arrLines.splice( arrLines.indexOf( auxLine ), 1 );
            this.setMap(null);
            
            var auxMarkerFrom = auxLine["from"];
            var auxMarkerTo   = auxLine["to"];
            
            auxMarkerFrom["to"] = null;
            auxMarkerTo["from"] = null;
        }
    });
    
    return oLine;
}