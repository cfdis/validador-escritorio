import { DOMParser } from 'xmldom';
import { QrParams } from "../utils/Interfaces";

export class XmlService {
    public async preProcessXml(xmlString: string): Promise<QrParams | null> {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

            // Buscamos el timbre fiscal digital
            const tfd = xmlDoc.getElementsByTagName('tfd:TimbreFiscalDigital')[0];
            if (!tfd) {
                return (null);
            }
            const sello = tfd.getAttribute('SelloCFD') || null;

            const comprobante = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0];
            const uuid = tfd.getAttribute('UUID') || null;
            const total = comprobante.getAttribute('Total') || null;

            let rfcEmisor = null, rfcReceptor = null;
            const emisorNodes = comprobante.getElementsByTagName('cfdi:Emisor');
            if (emisorNodes.length > 0) rfcEmisor = emisorNodes[0].getAttribute('Rfc');

            const receptorNodes = comprobante.getElementsByTagName('cfdi:Receptor');
            if (receptorNodes.length > 0) rfcReceptor = receptorNodes[0].getAttribute('Rfc');

            const last8 = sello?.slice(-8) || null;

            if (!uuid || !total || !rfcEmisor || !rfcReceptor || !last8) {
                return (null);
            }
            const qrData: QrParams = {
                id: uuid,
                re: rfcEmisor,
                rr: rfcReceptor,
                tt: total,
                fe: last8,
                // xml: xmlString,
            };

            return (qrData);
        } catch (error) {
            console.error('Error processing XML:', error);
            return (null);
        }
    }

}