<?php

$datos = $_POST["data"];
$fileName = $_POST["fileName"];

header("Content-type: application/xml");
$xml = new DOMDocument("1.0", "UTF-8");
$xml->formatOutput = true;
$xml->loadXML($datos);
$xml->save($fileName);
