// qrScanShared.ts
import $ from 'jquery';

export function renderQrTable(tableContainerId: string, qrResults: Record<string, string>[]) {
    const tbody = $('#' + tableContainerId).find('tbody');

    if (tbody.length === 0) {
        return;
    }

    tbody.empty();

    qrResults.forEach((item, index) => {
        const row = $(`
            <tr class="border-b border-gray-600">
                <td class="px-3 py-2">${item.id}</td>
                <td class="px-3 py-2">${item.re}</td>
                <td class="px-3 py-2">${item.rr}</td>
                <td class="px-3 py-2">$${item.tt}</td>
                <td class="px-3 py-2">
                    <button class="text-red-500 hover:text-red-700 font-semibold btn-remove" data-index="${index}">
                        <i class="material-icons">delete</i>
                    </button>
                </td>
            </tr>
        `);
        tbody.append(row);
    });

    $('#' + tableContainerId).toggle(qrResults.length > 0);
}
