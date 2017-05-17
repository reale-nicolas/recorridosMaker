<!DOCTYPE html>
<html>
     <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
        <title>Google Maps Maker</title>
        <link rel="stylesheet" href="css/styles.css">
        <style type="text/css">
            html, body {
                height: 100%;
                width:100%;
                margin: 0;
                padding: 0;
            }
            .main {
                position:relative;
                width:100%;
                height:100%;
            }
            .topButton {
                position: absolute;
                bottom:0;
                right:0;
                z-index:10;
            }
            
            #menu {
                float: left;
                height: 100%;
                width:20%;
                display:inline-block;
            }
            #map {
                float: left;
                height: 100%;
                width:80%;
                display:inline-block;
            }
            
            .fileContainer {
                overflow: hidden;
                position: relative;
                background-color: #616975;
                background-image: -webkit-linear-gradient(top, rgb(114, 122, 134), rgb(80, 88, 100)); 
            }
            
            .fileContainer [type=file] {
                cursor: inherit;
                display: block;
                font-size: 999px;
                filter: alpha(opacity=0);
                min-height: 100%;
                min-width: 100%;
                opacity: 0;
                position: absolute;
                right: 0;
                text-align: right;
                top:0;
            }
            
            #notificacionSector{
                    padding-top: 1em;
                    padding-bottom: 1em;
                    width: 90%;
                    background-color: #cccccc;
                    min-height: 100px;
                    /* padding: 10px; */
                    border-radius: 15px;
                    margin: 0 auto;
                    margin-top: 1.5em;
                    font-style: "Helvetica Neue", Helvetica, Arial, sans-serif;
                    font-size: smaller;
            }
        </style>
    </head>
    
    <body onload="initialize()">
    
        <div id="menu">
        
            <form name="submitKml" method="POST" action="#" id="afd"  style="display:none">
                <input type="file" name="nombreArchivo" id="nombreArchivo"/>
                <input type="button" name="submit" id="submit"/>
                <textarea id="textAreaXml"></textarea>
            </form>
            
            <div id = "barra"></div>
            <div id="wrapper">
            
                <ul class="menu">
                    <li class="item1">
                        <a href="#" id="liCargarArchivo">Cargar Archivo</a>
                        <ul>
                            <li class="subitem1"><a href="#"><input type="checkbox" id="checkMismoMapa">Mismo Mapa</input></a></li>
                            <li class="subitem1"><a href="#"><input type="checkbox" id="checkMostrarRecorrido">Mostrar Recorrido</input></a></li>
                            <li  id="btnExportar" class="subitem1"><a href="#">Exportar</a></li>
                            <li  id="btnCargar" class="subitem1"><a href="#">Cargar...</a></li>
                        </ul>
                    </li> 
                </ul>
            </div>
            
            <div id="notificacionSector">
            </div>
        </div>
        <div id="map"></div>
        
        <div class="topButton">
            <button type="button" onclick="initialize()">Google Maps</button>
        </div>
        <script type="text/javascript" src="js/jquery/jquery-3.1.1.js"></script>
        <script type="text/javascript" src="js/jquery/jquery-ui-1.12.1/jquery-ui.min.js"></script>
        <script type="text/javascript" src="http://localhost/mapas/maps.googleapis.js?key=AIzaSyDrseK5hT7_e3r_8_jf46QvFjxYW0hA4Sc&library=infowindow"></script>
        <!--<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=AIzaSyDrseK5hT7_e3r_8_jf46QvFjxYW0hA4Sc"></script>  -->
        <script type="text/javascript" src="script.js"></script>
        <script type="text/javascript" src="scriptMaps.js"></script>
        <script type="text/javascript">
                   
            $(document).ready(function() 
            {
                $("#liCargarArchivo").click(function()
                {
                     $("#nombreArchivo").click();
                });
                
                $("#btnExportar").click(function()
                {
                     exportarParadas();
                });
                
                $("#btnCargar").click(function()
                {
                     $("#submit").click();
                });
                
                $("#submit").click(function()
                {
                    var archivo = $("#nombreArchivo").val();
                    var arrArchivo = archivo.split("\\");
                    var nombreArchivo = arrArchivo[arrArchivo.length-1];
                    if (!($("#checkMismoMapa").is(":checked"))) {
                        clearMap();
                    }
//                    alert(nombreArchivo);
//                    cargarMapa(nombreArchivo);
                    var bMostrarRecorrido = false;
                    if ($("#checkMostrarRecorrido").is(":checked"))
                        bMostrarRecorrido = true;
                    var arrParadas = openXMLBusTravel(nombreArchivo, bMostrarRecorrido);
                    cargarRecorridoMapa( arrParadas);
                    
                });
                
                var lineStyleFoot = {
                    path: "M 0, -1 0, 1",
                    strokeOpacity: 1,
                    scale: 4
                };
                
                
            });
        </script>
    </body>

</html>