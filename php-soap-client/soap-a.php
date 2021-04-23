<?php
//Create the client object
//$soapclient = new SoapClient('https://www.w3schools.com/xml/tempconvert.asmx?WSDL');
$soapclient = new SoapClient('http://localhost:8787');

//Use the functions of the client, the params of the function are in
//the associative array
$params = array(
    'MessageStatus' => 'abc',
    'ReferenceType' => 'fff',
    'QuotedAmount' => '33',
);
$response = $soapclient->SetMessage($params);

var_dump($response);

