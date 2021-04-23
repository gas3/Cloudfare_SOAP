<?php

// turn off WSDL caching
ini_set("soap.wsdl_cache_enabled","0");

function SetMessage($message)
{
    return $message;
}


// initialize SOAP Server
$server=new SoapServer("test.wsdl");

// register available functions
$server->addFunction('SetMessage');

// start handling requests
$server->handle();


?>

