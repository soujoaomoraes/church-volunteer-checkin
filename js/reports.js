/**
 * Reports Module - CSV Export Logic
 * Sistema de Check-in/Check-out de Voluntários - Igreja Central
 */

const Reports = {
    /**
     * Initializes the Reports module.
     */
    init() {
        Utils.log('Reports module initialized');
    },

    /**
     * Exports all check-in/check-out data to a CSV file.
     */
    exportCheckinCheckoutToCsv() {
        Utils.log('Exporting data to CSV...');
        window.IndexedDB.getAllCheckins().then(allRecords => {
            if (!allRecords || allRecords.length === 0) {
                UI.showToast('Nenhum dado para exportar', 'Não há registros de check-in/check-out.', 'warning');
                return;
            }
            // Define CSV headers
            const headers = [
                'ID', 'Tipo', 'Nome', 'Telefone', 'Sessao', 
                'Data Check-in', 'Hora Check-in', 'Itens Retirados', 'Observacoes Check-in',
                'Data Check-out', 'Hora Check-out', 'Itens Devolvidos', 'Itens Pendentes', 'Observacoes Check-out',
                'Timestamp Registro'
            ];
            // Map data to CSV rows
            const csvRows = allRecords.map(record => {
                const row = [
                    record.id || '',
                    record.type || '',
                    record.nome || '',
                    record.telefone || '',
                    record.sessao || '',
                    record.data || '',
                    record.hora || '',
                    (record.itens || []).join('; ') || '',
                    record.observacoes || '',
                    record.checkoutData || '',
                    record.checkoutHora || '',
                    (record.returnedItems || []).join('; ') || '',
                    (record.pendingItems || []).join('; ') || '',
                    record.observacoesCheckout || '',
                    record.timestamp || ''
                ];
                return row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
            });
            // Combine headers and rows
            const csvContent = [headers.join(','), ...csvRows].join('\n');
            // Create Blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `registros_voluntarios_${Utils.formatDate(new Date()).replace(/\//g, '-')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            UI.showToast('Exportação concluída', 'Dados exportados para CSV com sucesso!', 'success');
            Utils.log('CSV export successful');
        }).catch(error => {
            Utils.logError('Erro ao exportar dados do IndexedDB', error);
            UI.showToast('Erro ao exportar', error.message, 'error');
        });
    }
};

// Make Reports immutable
Object.freeze(Reports);

// Export for use in other modules
window.Reports = Reports;
