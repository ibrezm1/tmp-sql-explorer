import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ExplorerView from './components/ExplorerView';
import ChatView from './components/ChatView';
import QueryGuide from './components/QueryGuide';
import TableModal from './components/TableModal';
import { callAI } from './services/aiService';

const API_KEY = ""; // Provided by environment at runtime

const App = () => {
  const [tablesData, setTablesData] = useState([]);
  const [fkData, setFkData] = useState([]);
  const [selectedDb, setSelectedDb] = useState(null);
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [columnSearchTerm, setColumnSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Hello! Upload your Table and Foreign Key CSVs, or load the Sample Pharmacy Data to see the new Description fields and segregated filtering in action." }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [viewMode, setViewMode] = useState('explorer');
  const [copyStatus, setCopyStatus] = useState(null);

  const [aiProvider, setAiProvider] = useState('gemini');
  const [vertexProject, setVertexProject] = useState('');
  const [vertexLocation, setVertexLocation] = useState('us-central1');
  const [vertexToken, setVertexToken] = useState('');

  const chatEndRef = useRef(null);

  const copyToClipboard = (text, id) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopyStatus(id);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const downloadCSVTemplate = (type) => {
    let headers = "";
    let content = "";
    let fileName = "";

    if (type === 'tables') {
      headers = "DatabaseName,TableName,TableDescription,ColumnName,DataType,IsNullable,Description";
      content = headers + "\n" +
        'Pharmacy_Real_v1,Patients,"Master patient index containing demographic, contact, and enrollment metadata. Use this as the source of truth for identity.",PatientID,INT (PK),NO,Primary unique identifier.\n' +
        'Pharmacy_Real_v1,Patients,"Master patient index containing demographic, contact, and enrollment metadata. Use this as the source of truth for identity.",FirstName,VARCHAR(100),NO,Patient legal first name.\n' +
        'Pharmacy_Real_v1,Patients,"Master patient index containing demographic, contact, and enrollment metadata. Use this as the source of truth for identity.",LastName,VARCHAR(100),NO,Patient legal last name.\n' +
        'Pharmacy_Real_v1,Patients,"Master patient index containing demographic, contact, and enrollment metadata. Use this as the source of truth for identity.",DOB,DATE,NO,Used for age verification and pediatric dosing checks.\n' +
        'Pharmacy_Real_v1,Patients,"Master patient index containing demographic, contact, and enrollment metadata. Use this as the source of truth for identity.",SSN_Last4,CHAR(4),YES,For identity confirmation during verification.\n' +
        'Pharmacy_Real_v1,Medications,"Central pharmacy drug catalog including brand names, clinical schedules, and logistics metadata.",MedicationID,INT (PK),NO,Primary unique identifier.\n' +
        'Pharmacy_Real_v1,Medications,"Central pharmacy drug catalog including brand names, clinical schedules, and logistics metadata.",BrandName,VARCHAR(200),NO,The commercial name of the drug product.\n' +
        'Pharmacy_Real_v1,Medications,"Central pharmacy drug catalog including brand names, clinical schedules, and logistics metadata.",GenericName,VARCHAR(200),NO,The standardized chemical name.\n' +
        'Pharmacy_Real_v1,Medications,"Central pharmacy drug catalog including brand names, clinical schedules, and logistics metadata.",DEA_Schedule,TINYINT,NO,Schedule I to V controlled substance status.\n' +
        'Pharmacy_Real_v1,Prescriptions,"Clinical script records that link Patients, Providers, and Medications for fulfillment.",PrescriptionID,BIGINT (PK),NO,Unique script number.\n' +
        'Pharmacy_Real_v1,Prescriptions,"Clinical script records that link Patients, Providers, and Medications for fulfillment.",PatientID,INT (FK),NO,Links back to the Patients table.\n' +
        'Pharmacy_Real_v1,Prescriptions,"Clinical script records that link Patients, Providers, and Medications for fulfillment.",MedicationID,INT (FK),NO,Links back to the Medications table.\n' +
        'Pharmacy_Real_v1,Prescriptions,"Clinical script records that link Patients, Providers, and Medications for fulfillment.",DateWritten,DATE,NO,Original signature date.\n' +
        'Pharmacy_Real_v1,Prescriptions,"Clinical script records that link Patients, Providers, and Medications for fulfillment.",RefillsAllowed,TINYINT,NO,Maximum refills permitted.\n' +
        'Pharmacy_Real_v1,Prescriptions,"Clinical script records that link Patients, Providers, and Medications for fulfillment.",DosageInstructions,TEXT,NO,Sig instructions for patient labeling.';
      fileName = "table_schema_template.csv";
    } else {
      headers = "ParentTable,ParentColumn,ReferencedTable,ReferencedColumn,ConstraintName";
      content = headers + "\n" +
        "Prescriptions,PatientID,Patients,PatientID,FK_Prescriptions_Patients\n" +
        "Prescriptions,MedicationID,Medications,MedicationID,FK_Prescriptions_Medications\n" +
        "Inventory,MedicationID,Medications,MedicationID,FK_Inventory_Medications";
      fileName = "foreign_keys_template.csv";
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadSamplePharmacyData = () => {
    const dbName = "Enterprise_Pharmacy_v2";
    const sampleTables = [
      { DatabaseName: dbName, TableName: 'Patients', TableDescription: 'Master patient index containing demographic and enrollment metadata.', ColumnName: 'PatientID', DataType: 'INT (PK)', IsNullable: 'NO', Description: 'Primary key for patients.' },
      { DatabaseName: dbName, TableName: 'Patients', TableDescription: 'Master patient index containing demographic and enrollment metadata.', ColumnName: 'FirstName', DataType: 'VARCHAR(100)', IsNullable: 'NO', Description: 'Patient legal first name.' },
      { DatabaseName: dbName, TableName: 'Patients', TableDescription: 'Master patient index containing demographic and enrollment metadata.', ColumnName: 'LastName', DataType: 'VARCHAR(100)', IsNullable: 'NO', Description: 'Patient legal last name.' },
      { DatabaseName: dbName, TableName: 'Patients', TableDescription: 'Master patient index containing demographic and enrollment metadata.', ColumnName: 'DOB', DataType: 'DATE', IsNullable: 'NO', Description: 'Date of birth for age validation.' },
      { DatabaseName: dbName, TableName: 'Patients', TableDescription: 'Master patient index containing demographic and enrollment metadata.', ColumnName: 'Gender', DataType: 'CHAR(1)', IsNullable: 'YES', Description: 'M/F/O/U.' },
      { DatabaseName: dbName, TableName: 'Patients', TableDescription: 'Master patient index containing demographic and enrollment metadata.', ColumnName: 'SSN_Last4', DataType: 'CHAR(4)', IsNullable: 'YES', Description: 'Last 4 digits of SSN.' },
      { DatabaseName: dbName, TableName: 'Patients', TableDescription: 'Master patient index containing demographic and enrollment metadata.', ColumnName: 'PrimaryPhone', DataType: 'VARCHAR(20)', IsNullable: 'YES', Description: 'Primary contact number.' },
      { DatabaseName: dbName, TableName: 'Patients', TableDescription: 'Master patient index containing demographic and enrollment metadata.', ColumnName: 'Email', DataType: 'VARCHAR(255)', IsNullable: 'YES', Description: 'Electronic mail address.' },
      { DatabaseName: dbName, TableName: 'Patients', TableDescription: 'Master patient index containing demographic and enrollment metadata.', ColumnName: 'AddressLine1', DataType: 'VARCHAR(255)', IsNullable: 'NO', Description: 'Street address.' },
      { DatabaseName: dbName, TableName: 'Patients', TableDescription: 'Master patient index containing demographic and enrollment metadata.', ColumnName: 'City', DataType: 'VARCHAR(100)', IsNullable: 'NO', Description: 'Mailing city.' },
      { DatabaseName: dbName, TableName: 'Patients', TableDescription: 'Master patient index containing demographic and enrollment metadata.', ColumnName: 'State', DataType: 'CHAR(2)', IsNullable: 'NO', Description: 'US State code.' },
      { DatabaseName: dbName, TableName: 'Patients', TableDescription: 'Master patient index containing demographic and enrollment metadata.', ColumnName: 'ZipCode', DataType: 'VARCHAR(10)', IsNullable: 'NO', Description: 'Mailing postal code.' },
      { DatabaseName: dbName, TableName: 'Patients', TableDescription: 'Master patient index containing demographic and enrollment metadata.', ColumnName: 'EnrollmentDate', DataType: 'DATETIME', IsNullable: 'NO', Description: 'Date of first registration.' },
      { DatabaseName: dbName, TableName: 'Medications', TableDescription: 'Central formulary and drug catalog including clinical and logistics data.', ColumnName: 'MedicationID', DataType: 'INT (PK)', IsNullable: 'NO', Description: 'Primary key for medications.' },
      { DatabaseName: dbName, TableName: 'Medications', TableDescription: 'Central formulary and drug catalog including clinical and logistics data.', ColumnName: 'BrandName', DataType: 'VARCHAR(200)', IsNullable: 'NO', Description: 'Commercial brand name.' },
      { DatabaseName: dbName, TableName: 'Medications', TableDescription: 'Central formulary and drug catalog including clinical and logistics data.', ColumnName: 'GenericName', DataType: 'VARCHAR(200)', IsNullable: 'NO', Description: 'Chemical generic name.' },
      { DatabaseName: dbName, TableName: 'Medications', TableDescription: 'Central formulary and drug catalog including clinical and logistics data.', ColumnName: 'SKU', DataType: 'VARCHAR(50)', IsNullable: 'NO', Description: 'Internal stock keeping unit.' },
      { DatabaseName: dbName, TableName: 'Medications', TableDescription: 'Central formulary and drug catalog including clinical and logistics data.', ColumnName: 'DEA_Schedule', DataType: 'TINYINT', IsNullable: 'NO', Description: 'Schedule I-V controlled status.' },
      { DatabaseName: dbName, TableName: 'Medications', TableDescription: 'Central formulary and drug catalog including clinical and logistics data.', ColumnName: 'DosageForm', DataType: 'VARCHAR(50)', IsNullable: 'NO', Description: 'Tablet, Capsule, Liquid, etc.' },
      { DatabaseName: dbName, TableName: 'Medications', TableDescription: 'Central formulary and drug catalog including clinical and logistics data.', ColumnName: 'Strength', DataType: 'VARCHAR(50)', IsNullable: 'NO', Description: 'Mg or mL concentration.' },
      { DatabaseName: dbName, TableName: 'Medications', TableDescription: 'Central formulary and drug catalog including clinical and logistics data.', ColumnName: 'UnitOfMeasure', DataType: 'VARCHAR(20)', IsNullable: 'NO', Description: 'Count, Vol, or Weight units.' },
      { DatabaseName: dbName, TableName: 'Medications', TableDescription: 'Central formulary and drug catalog including clinical and logistics data.', ColumnName: 'PackageSize', DataType: 'DECIMAL(10,2)', IsNullable: 'NO', Description: 'Units per retail package.' },
      { DatabaseName: dbName, TableName: 'Medications', TableDescription: 'Central formulary and drug catalog including clinical and logistics data.', ColumnName: 'Manufacturer', DataType: 'VARCHAR(150)', IsNullable: 'NO', Description: 'Pharma company name.' },
      { DatabaseName: dbName, TableName: 'Medications', TableDescription: 'Central formulary and drug catalog including clinical and logistics data.', ColumnName: 'StorageCondition', DataType: 'VARCHAR(100)', IsNullable: 'YES', Description: 'Refrigerated or Ambient.' },
      { DatabaseName: dbName, TableName: 'Prescriptions', TableDescription: 'Clinical orders linking patients to specific medications and providers.', ColumnName: 'PrescriptionID', DataType: 'BIGINT (PK)', IsNullable: 'NO', Description: 'Unique script identifier.' },
      { DatabaseName: dbName, TableName: 'Prescriptions', TableDescription: 'Clinical orders linking patients to specific medications and providers.', ColumnName: 'PatientID', DataType: 'INT (FK)', IsNullable: 'NO', Description: 'Reference to Patients.' },
      { DatabaseName: dbName, TableName: 'Prescriptions', TableDescription: 'Clinical orders linking patients to specific medications and providers.', ColumnName: 'ProviderID', DataType: 'INT (FK)', IsNullable: 'NO', Description: 'Reference to Providers.' },
      { DatabaseName: dbName, TableName: 'Prescriptions', TableDescription: 'Clinical orders linking patients to specific medications and providers.', ColumnName: 'MedicationID', DataType: 'INT (FK)', IsNullable: 'NO', Description: 'Reference to Medications.' },
      { DatabaseName: dbName, TableName: 'Prescriptions', TableDescription: 'Clinical orders linking patients to specific medications and providers.', ColumnName: 'DateWritten', DataType: 'DATE', IsNullable: 'NO', Description: 'Date script was signed.' },
      { DatabaseName: dbName, TableName: 'Prescriptions', TableDescription: 'Clinical orders linking patients to specific medications and providers.', ColumnName: 'RefillsAllowed', DataType: 'TINYINT', IsNullable: 'NO', Description: 'Max number of refills.' },
      { DatabaseName: dbName, TableName: 'Prescriptions', TableDescription: 'Clinical orders linking patients to specific medications and providers.', ColumnName: 'QuantityDispensed', DataType: 'DECIMAL(10,2)', IsNullable: 'NO', Description: 'Amount per fill.' },
      { DatabaseName: dbName, TableName: 'Prescriptions', TableDescription: 'Clinical orders linking patients to specific medications and providers.', ColumnName: 'DaysSupply', DataType: 'SMALLINT', IsNullable: 'NO', Description: 'Duration of medication per fill.' },
      { DatabaseName: dbName, TableName: 'Prescriptions', TableDescription: 'Clinical orders linking patients to specific medications and providers.', ColumnName: 'DosageInstructions', DataType: 'TEXT', IsNullable: 'NO', Description: 'Patient directions (Sig).' },
      { DatabaseName: dbName, TableName: 'Prescriptions', TableDescription: 'Clinical orders linking patients to specific medications and providers.', ColumnName: 'IsActive', DataType: 'BIT', IsNullable: 'NO', Description: 'Current status of order.' },
      { DatabaseName: dbName, TableName: 'Inventory', TableDescription: 'Stock levels and tracking for shelf medications per store location.', ColumnName: 'InventoryID', DataType: 'INT (PK)', IsNullable: 'NO', Description: 'Primary key for stock record.' },
      { DatabaseName: dbName, TableName: 'Inventory', TableDescription: 'Stock levels and tracking for shelf medications per store location.', ColumnName: 'StoreID', DataType: 'INT (FK)', IsNullable: 'NO', Description: 'Reference to Stores.' },
      { DatabaseName: dbName, TableName: 'Inventory', TableDescription: 'Stock levels and tracking for shelf medications per store location.', ColumnName: 'MedicationID', DataType: 'INT (FK)', IsNullable: 'NO', Description: 'Reference to Medications.' },
      { DatabaseName: dbName, TableName: 'Inventory', TableDescription: 'Stock levels and tracking for shelf medications per store location.', ColumnName: 'QuantityOnHand', DataType: 'INT', IsNullable: 'NO', Description: 'Current shelf count.' },
      { DatabaseName: dbName, TableName: 'Inventory', TableDescription: 'Stock levels and tracking for shelf medications per store location.', ColumnName: 'ReorderPoint', DataType: 'INT', IsNullable: 'NO', Description: 'Auto-refill threshold.' },
      { DatabaseName: dbName, TableName: 'Inventory', TableDescription: 'Stock levels and tracking for shelf medications per store location.', ColumnName: 'LastRestockDate', DataType: 'DATETIME', IsNullable: 'YES', Description: 'Date of last stock update.' },
      { DatabaseName: dbName, TableName: 'Inventory', TableDescription: 'Stock levels and tracking for shelf medications per store location.', ColumnName: 'ExpiryDate', DataType: 'DATE', IsNullable: 'YES', Description: 'Lot expiration date.' },
      { DatabaseName: dbName, TableName: 'Inventory', TableDescription: 'Stock levels and tracking for shelf medications per store location.', ColumnName: 'LocationBin', DataType: 'VARCHAR(20)', IsNullable: 'YES', Description: 'Physical shelf coordinates.' },
      { DatabaseName: dbName, TableName: 'Inventory', TableDescription: 'Stock levels and tracking for shelf medications per store location.', ColumnName: 'UnitCost', DataType: 'MONEY', IsNullable: 'NO', Description: 'Acquisition cost per unit.' },
      { DatabaseName: dbName, TableName: 'Inventory', TableDescription: 'Stock levels and tracking for shelf medications per store location.', ColumnName: 'IsDiscontinued', DataType: 'BIT', IsNullable: 'NO', Description: 'Discontinuation flag.' },
      { DatabaseName: dbName, TableName: 'Doctors', TableDescription: 'Healthcare providers authorized to prescribe medications.', ColumnName: 'DoctorID', DataType: 'INT (PK)', IsNullable: 'NO', Description: 'Primary key for doctors.' },
      { DatabaseName: dbName, TableName: 'Doctors', TableDescription: 'Healthcare providers authorized to prescribe medications.', ColumnName: 'FirstName', DataType: 'VARCHAR(100)', IsNullable: 'NO', Description: 'Doctor first name.' },
      { DatabaseName: dbName, TableName: 'Doctors', TableDescription: 'Healthcare providers authorized to prescribe medications.', ColumnName: 'LastName', DataType: 'VARCHAR(100)', IsNullable: 'NO', Description: 'Doctor last name.' },
      { DatabaseName: dbName, TableName: 'Doctors', TableDescription: 'Healthcare providers authorized to prescribe medications.', ColumnName: 'Specialty', DataType: 'VARCHAR(100)', IsNullable: 'YES', Description: 'Medical specialty.' },
      { DatabaseName: dbName, TableName: 'Doctors', TableDescription: 'Healthcare providers authorized to prescribe medications.', ColumnName: 'NPI_Number', DataType: 'CHAR(10)', IsNullable: 'NO', Description: 'National Provider Identifier.' },
      { DatabaseName: dbName, TableName: 'Orders', TableDescription: 'Point-of-sale transactions for pharmacy prescriptions.', ColumnName: 'OrderID', DataType: 'BIGINT (PK)', IsNullable: 'NO', Description: 'Unique order number.' },
      { DatabaseName: dbName, TableName: 'Orders', TableDescription: 'Point-of-sale transactions for pharmacy prescriptions.', ColumnName: 'PatientID', DataType: 'INT (FK)', IsNullable: 'NO', Description: 'Linking to Patient.' },
      { DatabaseName: dbName, TableName: 'Orders', TableDescription: 'Point-of-sale transactions for pharmacy prescriptions.', ColumnName: 'DoctorID', DataType: 'INT (FK)', IsNullable: 'NO', Description: 'Linking to Doctor.' },
      { DatabaseName: dbName, TableName: 'Orders', TableDescription: 'Point-of-sale transactions for pharmacy prescriptions.', ColumnName: 'OrderDate', DataType: 'DATETIME', IsNullable: 'NO', Description: 'Timestamp of transaction.' },
      { DatabaseName: dbName, TableName: 'Orders', TableDescription: 'Point-of-sale transactions for pharmacy prescriptions.', ColumnName: 'TotalAmount', DataType: 'MONEY', IsNullable: 'NO', Description: 'Final sale price.' }
    ];

    const sampleFKs = [
      { ParentTable: 'Prescriptions', ParentColumn: 'PatientID', ReferencedTable: 'Patients', ReferencedColumn: 'PatientID', ConstraintName: 'FK_Prescriptions_Patients' },
      { ParentTable: 'Prescriptions', ParentColumn: 'MedicationID', ReferencedTable: 'Medications', ReferencedColumn: 'MedicationID', ConstraintName: 'FK_Prescriptions_Medications' },
      { ParentTable: 'Prescriptions', ParentColumn: 'ProviderID', ReferencedTable: 'Doctors', ReferencedColumn: 'DoctorID', ConstraintName: 'FK_Prescriptions_Doctors' },
      { ParentTable: 'Inventory', ParentColumn: 'MedicationID', ReferencedTable: 'Medications', ReferencedColumn: 'MedicationID', ConstraintName: 'FK_Inventory_Medications' },
      { ParentTable: 'Orders', ParentColumn: 'PatientID', ReferencedTable: 'Patients', ReferencedColumn: 'PatientID', ConstraintName: 'FK_Orders_Patients' },
      { ParentTable: 'Orders', ParentColumn: 'DoctorID', ReferencedTable: 'Doctors', ReferencedColumn: 'DoctorID', ConstraintName: 'FK_Orders_Doctors' }
    ];

    setTablesData(sampleTables);
    setFkData(sampleFKs);
    setTimeout(() => {
      setSelectedDb(dbName);
      setViewMode('explorer');
    }, 0);
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;

      const parseCSV = (str) => {
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let inQuotes = false;

        for (let i = 0; i < str.length; i++) {
          const char = str[i];
          const nextChar = str[i + 1];

          if (char === '"' && inQuotes && nextChar === '"') {
            currentCell += '"';
            i++;
          } else if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = '';
          } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (currentCell !== '' || currentRow.length > 0) {
              currentRow.push(currentCell.trim());
              rows.push(currentRow);
              currentRow = [];
              currentCell = '';
            }
            if (char === '\r' && nextChar === '\n') i++;
          } else {
            currentCell += char;
          }
        }
        if (currentCell !== '' || currentRow.length > 0) {
          currentRow.push(currentCell.trim());
          rows.push(currentRow);
        }
        return rows;
      };

      const rows = parseCSV(text);
      if (rows.length === 0) return;

      const headers = rows[0];
      const data = rows.slice(1).filter(r => r.length >= headers.length).map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
        return obj;
      });

      if (type === 'tables') {
        setTablesData(data);
        const uniqueDbs = [...new Set(data.map(d => d.DatabaseName || d.Database || 'Default'))];
        if (uniqueDbs.length > 0) setSelectedDb(uniqueDbs[0]);
      } else {
        setFkData(data);
      }
      setViewMode('explorer');
    };
    reader.readAsText(file);
  };

  const getSchemaContext = () => {
    if (tablesData.length === 0) return "No schema loaded.";

    // Group columns by table
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

    if (fkData.length > 0) {
      schemaStr += "FOREIGN KEY RELATIONSHIPS:\n";
      fkData.forEach(fk => {
        schemaStr += `- ${fk.ParentTable}.${fk.ParentColumn} -> ${fk.ReferencedTable}.${fk.ReferencedColumn} (${fk.ConstraintName})\n`;
      });
    }

    return schemaStr;
  };

  const SQL_TABLE_QUERY = `SELECT 
    DB_NAME() AS [DatabaseName],
    t.name AS [TableName],
    ISNULL(CAST(sep.value AS VARCHAR(MAX)), '') AS [TableDescription],
    c.name AS [ColumnName],
    ty.name + 
        CASE WHEN ty.name IN ('varchar', 'char', 'nvarchar', 'nchar') 
        THEN '(' + CASE WHEN c.max_length = -1 THEN 'MAX' ELSE CAST(c.max_length AS VARCHAR(5)) END + ')' 
        ELSE '' END AS [DataType],
    CASE WHEN c.is_nullable = 1 THEN 'YES' ELSE 'NO' END AS [IsNullable],
    ISNULL(CAST(sep_col.value AS VARCHAR(MAX)), '') AS [Description]
FROM sys.tables t
JOIN sys.columns c ON t.object_id = c.object_id
JOIN sys.types ty ON c.user_type_id = ty.user_type_id
LEFT JOIN sys.extended_properties sep ON t.object_id = sep.major_id AND sep.minor_id = 0 AND sep.name = 'MS_Description'
LEFT JOIN sys.extended_properties sep_col ON t.object_id = sep_col.major_id AND c.column_id = sep_col.minor_id AND sep_col.name = 'MS_Description'
ORDER BY t.name, c.column_id;`;

  const SQL_FK_QUERY = `SELECT 
    OBJECT_NAME(fk.parent_object_id) AS [ParentTable],
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS [ParentColumn],
    OBJECT_NAME(fk.referenced_object_id) AS [ReferencedTable],
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS [ReferencedColumn],
    fk.name AS [ConstraintName]
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id;`;

  const databases = useMemo(() => {
    return [...new Set(tablesData.map(d => d.DatabaseName || d.Database || 'Default'))];
  }, [tablesData]);

  const filteredTables = useMemo(() => {
    if (!selectedDb) return [];
    const dbTables = tablesData.filter(t => (t.DatabaseName || t.Database || 'Default') === selectedDb);
    const grouped = {};
    dbTables.forEach(row => {
      const tableName = row.TableName || row.Table;
      if (!grouped[tableName]) {
        grouped[tableName] = {
          name: tableName,
          description: row.TableDescription || row.Table_Description || 'No description.',
          columns: []
        };
      }
      grouped[tableName].columns.push({
        name: row.ColumnName || row.Column,
        type: row.DataType || row.Type,
        isNullable: row.IsNullable,
        description: row.Description || row.ColumnDescription || 'No description.'
      });
    });
    const tSearch = tableSearchTerm.toLowerCase();
    const cSearch = columnSearchTerm.toLowerCase();

    return Object.values(grouped).filter(t => {
      const tableMatch = (t.name || "").toLowerCase().includes(tSearch);
      const columnOrDescMatch = t.columns.some(col =>
        (col.name || "").toLowerCase().includes(cSearch) ||
        (col.description || "").toLowerCase().includes(cSearch)
      );
      return tableMatch && (cSearch === '' || columnOrDescMatch);
    }).map(t => {
      if (cSearch !== '') {
        const sortedCols = [...t.columns].sort((a, b) => {
          const aMatch = (a.name || "").toLowerCase().includes(cSearch) || (a.description || "").toLowerCase().includes(cSearch);
          const bMatch = (b.name || "").toLowerCase().includes(cSearch) || (b.description || "").toLowerCase().includes(cSearch);
          return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
        });
        return { ...t, columns: sortedCols };
      }
      return t;
    });
  }, [tablesData, selectedDb, tableSearchTerm, columnSearchTerm]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const userMsg = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    const aiResponse = await callAI({
      prompt: userMsg,
      tablesData,
      fkData,
      selectedDb,
      config: {
        aiProvider,
        vertexProject,
        vertexLocation,
        vertexToken,
        apiKey: API_KEY // Pass API_KEY here
      }
    });

    setChatMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    setIsChatLoading(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <Sidebar
        databases={databases}
        selectedDb={selectedDb}
        setSelectedDb={setSelectedDb}
        viewMode={viewMode}
        setViewMode={setViewMode}
        loadSamplePharmacyData={loadSamplePharmacyData}
        downloadCSVTemplate={downloadCSVTemplate}
        handleFileUpload={handleFileUpload}
        tablesData={tablesData}
        fkData={fkData}
        aiProvider={aiProvider}
        setAiProvider={setAiProvider}
        vertexProject={vertexProject}
        setVertexProject={setVertexProject}
        vertexLocation={vertexLocation}
        setVertexLocation={setVertexLocation}
        vertexToken={vertexToken}
        setVertexToken={setVertexToken}
      />

      <main className="flex-1 overflow-auto p-8 max-w-7xl mx-auto">
        {(viewMode === 'explorer' || viewMode === 'graph') && (
          <ExplorerView
            viewMode={viewMode}
            tableSearchTerm={tableSearchTerm}
            setTableSearchTerm={setTableSearchTerm}
            columnSearchTerm={columnSearchTerm}
            setColumnSearchTerm={setColumnSearchTerm}
            filteredTables={filteredTables}
            setSelectedTable={setSelectedTable}
            fkData={fkData}
          />
        )}

        {viewMode === 'help' && (
          <QueryGuide
            SQL_TABLE_QUERY={SQL_TABLE_QUERY}
            SQL_FK_QUERY={SQL_FK_QUERY}
            copyToClipboard={copyToClipboard}
            copyStatus={copyStatus}
          />
        )}

        {viewMode === 'chat' && (
          <ChatView
            chatMessages={chatMessages}
            chatEndRef={chatEndRef}
            handleSendMessage={handleSendMessage}
            userInput={userInput}
            setUserInput={setUserInput}
          />
        )}
      </main>

      <TableModal
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
        fkData={fkData}
        filteredTables={filteredTables}
      />
    </div>
  );
};

export default App;