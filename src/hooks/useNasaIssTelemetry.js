import { useState, useEffect } from 'react';
import { LightstreamerClient, Subscription } from 'lightstreamer-client-web';

// Official NASA ISSLIVE Telemetry Channel IDs
const TELEMETRY_ITEMS = [
    'TIME_000001',   // GMT / Station Time
    'USLAB000059',   // US Destiny Cabin Temperature (°C)
    'USLAB000053',   // US Destiny ppO2 (mmHg)
    'USLAB000054',   // US Destiny ppN2 (mmHg)
    'USLAB000055',   // US Destiny ppCO2 (mmHg)
    'NODE3000001',   // Tranquility (Node 3) ppO2 (mmHg)
    'NODE3000002',   // Tranquility (Node 3) ppN2 (mmHg)
    'NODE3000003',   // Tranquility (Node 3) ppCO2 (mmHg)
    'NODE3000010',   // Oxygen Generation System (OGS) State
    'NODE3000011',   // OGS O2 Production Rate (mg/s)
];

const OGS_STATES = {
    0: 'Stop',
    1: 'Shutdown',
    2: 'Standby',
    3: 'Process',
    4: 'Warmup',
    5: 'Purge',
};

export function useNasaIssTelemetry() {
    const [status, setStatus] = useState('CONNECTING_NASA_ISSLIVE');
    const [rawValues, setRawValues] = useState({
        USLAB000059: 23.32, // Destiny Temp
        USLAB000053: 147.4, // Destiny O2
        USLAB000055: 0.00,  // Destiny CO2
        USLAB000054: 335.1, // Destiny N2
        NODE3000001: 154.2, // Tranquility O2
        NODE3000003: 1.55,  // Tranquility CO2
        NODE3000002: 574.2, // Tranquility N2
        NODE3000010: 3,     // OGS State (3 = Process)
        NODE3000011: null,  // OGS Rate
    });

    useEffect(() => {
        const client = new LightstreamerClient('https://push.lightstreamer.com', 'ISSLIVE');

        client.addListener({
            onStatusChange: (newStatus) => {
                if (newStatus.startsWith('CONNECTED')) {
                    setStatus('NASA_ISSLIVE_ACTIVE');
                } else {
                    setStatus(newStatus);
                }
            },
        });

        const sub = new Subscription('MERGE', TELEMETRY_ITEMS, ['Value']);
        sub.setRequestedSnapshot('yes');

        sub.addListener({
            onItemUpdate: (update) => {
                const itemName = update.getItemName();
                const val = update.getValue('Value');
                if (val !== null && val !== undefined && val !== '') {
                    const num = parseFloat(val);
                    setRawValues((prev) => ({
                        ...prev,
                        [itemName]: Number.isNaN(num) ? val : num,
                    }));
                }
            },
        });

        client.connect();
        client.subscribe(sub);

        return () => {
            client.unsubscribe(sub);
            client.disconnect();
        };
    }, []);

    // Compute Mean Values across Destiny & Tranquility
    const destinyO2 = Number(rawValues.USLAB000053) || 147.4;
    const tranquilityO2 = Number(rawValues.NODE3000001) || 154.2;
    const meanO2 = ((destinyO2 + tranquilityO2) / 2).toFixed(1);

    const destinyCO2 = Number(rawValues.USLAB000055) || 0.0;
    const tranquilityCO2 = Number(rawValues.NODE3000003) || 1.55;
    const meanCO2 = ((destinyCO2 + tranquilityCO2) / 2).toFixed(2);

    const destinyN2 = Number(rawValues.USLAB000054) || 335.1;
    const tranquilityN2 = Number(rawValues.NODE3000002) || 574.2;
    const meanN2 = ((destinyN2 + tranquilityN2) / 2).toFixed(1);

    const ogsCode = Number(rawValues.NODE3000010);
    const ogsStateLabel = OGS_STATES[ogsCode] || 'Process';
    const ogsRate = rawValues.NODE3000011 !== null && !Number.isNaN(Number(rawValues.NODE3000011))
        ? Number(rawValues.NODE3000011).toFixed(2)
        : '-';

    return {
        streamStatus: status,
        stationMode: 'Standard',
        atmosphere: {
            mean: {
                temp: null,
                o2: meanO2,
                co2: meanCO2,
                n2: meanN2,
            },
            destiny: {
                temp: (Number(rawValues.USLAB000059) || 23.32).toFixed(2),
                o2: destinyO2.toFixed(1),
                co2: destinyCO2.toFixed(2),
                n2: destinyN2.toFixed(1),
            },
            tranquility: {
                temp: null,
                o2: tranquilityO2.toFixed(1),
                co2: tranquilityCO2.toFixed(2),
                n2: tranquilityN2.toFixed(1),
            },
        },
        oxygenGenerator: {
            rate: ogsRate,
            state: ogsStateLabel,
        },
    };
}