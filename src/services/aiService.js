const API_KEY = ""; // Replace with your Gemini API Key if using Gemini Studio

export const getSchemaContext = (tablesData, fkData) => {
    if (!tablesData || tablesData.length === 0) return "No schema loaded.";

    const tables = {};
    tablesData.forEach(row => {
        const tName = row.TableName || row.Table;
        if (!tables[tName]) {
            tables[tName] = { desc: row.TableDescription || '', cols: [] };
        }
        tables[tName].cols.push(`${row.ColumnName} (${row.DataType}) - ${row.Description || ''}`);
    });

    let schemaStr = "FULL DATABASE SCHEMA:\n\n";
    Object.entries(tables).forEach(([name, data]) => {
        schemaStr += `TABLE: ${name}\nDESCRIPTION: ${data.desc}\nCOLUMNS:\n- ${data.cols.join('\n- ')}\n\n`;
    });

    if (fkData && fkData.length > 0) {
        schemaStr += "FOREIGN KEY RELATIONSHIPS:\n";
        fkData.forEach(fk => {
            schemaStr += `- ${fk.ParentTable}.${fk.ParentColumn} -> ${fk.ReferencedTable}.${fk.ReferencedColumn} (${fk.ConstraintName})\n`;
        });
    }

    return schemaStr;
};

export const callAI = async ({
    prompt,
    tablesData,
    fkData,
    selectedDb,
    config
}) => {
    const {
        aiProvider,
        vertexProject,
        vertexLocation,
        vertexToken,
        apiKey
    } = config;

    const fullSchema = getSchemaContext(tablesData, fkData);
    const systemInstruction = `You are a SQL Architect. You have access to the full database schema provided below. Use it to answer user questions, explain relationships, or write queries.
  
  Database: ${selectedDb || 'Unknown'}
  
  ${fullSchema}`;

    try {
        if (aiProvider === 'gemini') {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] }
                })
            });
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error processing request.";
        } else {
            const url = `https://${vertexLocation}-aiplatform.googleapis.com/v1/projects/${vertexProject}/locations/${vertexLocation}/publishers/google/models/gemini-1.5-flash:streamGenerateContent`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${vertexToken}`
                },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] }
                })
            });

            const text = await response.text();
            try {
                const json = JSON.parse(text);
                if (json.candidates) return json.candidates[0].content.parts[0].text;
                if (Array.isArray(json)) {
                    return json.map(chunk => chunk.candidates[0].content.parts[0].text).join('');
                }
            } catch (e) {
                try {
                    const lines = text.trim().split('\n');
                    return lines.map(line => JSON.parse(line).candidates[0].content.parts[0].text).join('');
                } catch (e2) {
                    return "Vertex AI Error: Check Project ID, Token, and CORS settings.";
                }
            }
        }
    } catch (error) {
        console.error("AI Service Error:", error);
        return "Error connecting to AI service.";
    }
};
