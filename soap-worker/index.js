var convert = require("xml-js");
var inspect = require("util").inspect;

const wsdlDefinition = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:soap12="http://schemas.xmlsoap.org/wsdl/soap12/" xmlns:tns="Messaging" name="MessageConversion" targetNamespace="Messaging">
    <types>
        <xs:schema elementFormDefault="qualified" targetNamespace="Messaging">
            <xs:element name="SetMessageRequest">
                <xs:complexType>
                    <xs:all>
                        <xs:element name="MessageStatus" type="xs:string"/>
                        <xs:element name="ReferenceType" type="xs:string"/>
                        <xs:element name="QuotedAmount" type="xs:unsignedLong"/>
                    </xs:all>
                </xs:complexType>
            </xs:element>
            <xs:element name="SetMessageResponse">
                <xs:complexType>
                    <xs:all>
                        <xs:element name="MessageStatus" type="xs:string"/>
                        <xs:element name="ReferenceType" type="xs:string"/>
                        <xs:element name="QuotedAmount" type="xs:unsignedLong"/>
                        <xs:element name="Status" type="xs:string"/>
                    </xs:all>
                </xs:complexType>
            </xs:element>
        </xs:schema>
    </types>
    <message name="SetMessageSoapRequest">
        <part name="parameters" element="tns:SetMessageRequest"/>
    </message>
    <message name="SetMessageSoapResponse">
        <part name="parameters" element="tns:SetMessageResponse"/>
    </message>
    <portType name="MessageConversionSoapType">
        <operation name="SetMessage">
            <input message="tns:SetMessageSoapRequest"/>
            <output message="tns:SetMessageSoapResponse"/>
        </operation>
    </portType>
    <binding name="MessageConversionSoapBinding" type="tns:MessageConversionSoapType">
        <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
        <operation name="SetMessage">
            <soap:operation soapAction="http://localhost:8787/" style="document"/>
            <input>
                <soap:body use="literal"/>
            </input>
            <output>
                <soap:body use="literal"/>
            </output>
        </operation>
    </binding>
    <service name="MessageConversion">
        <port name="MessageConversionSoap" binding="tns:MessageConversionSoapBinding">
            <soap:address location="http://localhost:8787/"/>
        </port>
    </service>
</definitions>
`;

const SOAP_URL = "http://soap.uitcpro.com/soap_server.php?wsdl";

async function callSoapApi(body) {
  const init = {
    method: "POST",
    body: body,
    redirect: "follow",
    headers: {
      "Content-Type": "text/xml",
    },
    cf: { apps: false },
  };

  try {
    const response = await fetch(SOAP_URL, init);
    const result = response.text();
    return result;
  } catch (e) {
    console.log("call soap api error: ");
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

async function handleRequest(request) {
  const { headers } = request;
  const contentType = headers.get("content-type") || "";

  if (contentType.includes("text/xml")) {
    console.log("====soap xml=======");
    const text = await request.text();
    console.log(text);

    var xml_obj = convert.xml2js(text);
    const envelope = xml_obj.elements[0];
    const body = envelope.elements[0];
    const params = body.elements;

    const params_added = Object.assign([], params);
    // params_added[0]["name"] = "ns1:SetMessageResponse";
    params_added[0].elements.push({
      type: "element",
      name: "ns1:Status",
      elements: [{ type: "text", text: "New" }],
    });

    // console.log(JSON.stringify(envelope));
    console.log("====params=======");
    console.log(inspect(params, { colors: true, depth: Infinity }));
    console.log("====params_added=======");
    console.log(inspect(params_added, { colors: true, depth: Infinity }));

    // Set params_added
    params[0] = params_added[0];

    xml_str = convert.js2xml(xml_obj);

    console.log("Call SOAP with body: ", xml_str);

    soap_result = await callSoapApi(xml_str);

    console.log("Soap call result: ");
    console.log(inspect(soap_result, { colors: true, depth: Infinity }));

    // return the SOAP result back
    return new Response(soap_result);
  }
}

addEventListener("fetch", (event) => {
  const { request } = event;
  const { url } = request;

  if (request.method === "POST") {
    return event.respondWith(handleRequest(request));
  } else if (request.method === "GET") {
    return event.respondWith(new Response(wsdlDefinition));
  }
});
