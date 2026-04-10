import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { FilterMatchMode } from "primereact/api";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function Assets() {
  const [assets, setAssets] = useState([]);
  const [addFormData, setAddFormData] = useState({
    assetCode: "",
    assetName: "",
    quantity: 0
  });
  const [globalFilter, setGlobalFilter] = useState("");

  const fetchAssets = async () => {
    const res = await axios.get("http://localhost:5016/assets");
    setAssets(res.data);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5016/assets", addFormData);
    setAddFormData({ assetCode: "", assetName: "", quantity: 0 });
    fetchAssets();
  };

  const exportXLSX = () => {

    if (!assets || assets.length === 0) {
      alert("No data to export");
      return;
    }

    // convert JSON → worksheet
    const worksheet = XLSX.utils.json_to_sheet(assets);

    // create workbook
    const workbook = {
      Sheets: { Data: worksheet },
      SheetNames: ["Data"]
    };

    // generate excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    // save file
    const fileData = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
    });

    saveAs(fileData, "Assets.xlsx");
  };

  const renderHeader = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        {/* LEFT SIDE - SEARCH */}
        <span className="p-input-icon-right">
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search Asset..."
            style={{ width: "250px" }}
          />
          <i
            className="pi pi-search"
            style={{
              position: "absolute",
              right: "10px",
              top: "70%",
              transform: "translateY(-50%)",
              color: "#6b7280"
            }}
          />
        </span>

        {/* RIGHT SIDE - EXPORT BUTTON */}
        <Button
          label="Export XLSX"
          icon="pi pi-file-excel"
          style={{
            backgroundColor: "#22c55e",
            borderColor: "#22c55e",
            color: "#fff"
          }}
          onClick={exportXLSX}
        />
      </div>
    );
  };

  // Native row edit handlers
  const onRowEditComplete = async (e) => {
    const { newData } = e;
    await axios.put(`http://localhost:5016/assets/${newData.assetId}`, newData);
    fetchAssets(); // Refresh
  };

  const textEditor = (options) => <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.value)} />;
  const quantityEditor = (options) => (
    <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value ?? 0)} mode="decimal" />
  );
  const rowEditorInitTemplate = () => <i className="pi pi-fw pi-pencil" style={{ color: '#2196F3' }}></i>;
  const rowEditorSaveTemplate = () => <i className="pi pi-fw pi-check" style={{ color: '#4CAF50' }}></i>;
  const rowEditorCancelTemplate = () => <i className="pi pi-fw pi-times" style={{ color: '#E91E63' }}></i>;

  return (
    <div style={{
      maxWidth: "1500px",
      margin: "20px 20px 20px 60px",
      padding: "20px",
      // background: "#eddfee",
      background: "linear-gradient(135deg, #57c87e, #bb86f3)",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
    }}>
      <h2>Assets</h2>

      {/* ADD FORM */}
      <form onSubmit={handleAddSubmit} style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
            Asset Code
          </label>
          <InputText
            placeholder="Asset Code"
            value={addFormData.assetCode}
            onChange={(e) => setAddFormData({ ...addFormData, assetCode: e.target.value })}
            className="w-full"
            keyfilter="alphanum"
            maxLength={10}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
            Asset Name
          </label>
          <InputText
            placeholder="Asset Name"
            value={addFormData.assetName}
            onChange={(e) => setAddFormData({ ...addFormData, assetName: e.target.value })}
            className="w-full"
            keyfilter={/^[a-zA-Z \s]+$/}
            maxLength={30}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
            Quantity
          </label>
          <InputNumber
            placeholder="Quantity"
            value={addFormData.quantity}
            onValueChange={(e) => setAddFormData({ ...addFormData, quantity: e.value ?? 0 })}
            mode="decimal"
            className="w-full"
            maxLength={2}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <Button
            label="Add"
            icon="pi pi-plus"
            size="small"
            style={{ height: "38px" }}
          />
        </div>

      </form>

      {/* DATA TABLE with Native Row Editing */}
      <DataTable
        value={assets}
        editMode="row"
        dataKey="assetId"
        rowsPerPageOptions={[5, 10, 20]}
        onRowEditComplete={onRowEditComplete}
        paginator rows={5} stripedRows showGridlines
        tableStyle={{ minWidth: '50rem' }}

        header={renderHeader()}
        globalFilter={globalFilter}
        globalFilterFields={["assetId", "assetCode", "assetName", "quantity"]}
      >
        <Column field="assetId" header="ID" style={{ minWidth: '100px' }} frozen />
        <Column
          field="assetCode"
          header="Code"
          editor={textEditor}
          style={{ minWidth: '150px' }}
        />
        <Column
          field="assetName"
          header="Name"
          editor={textEditor}
          style={{ minWidth: '200px' }}
        />
        <Column
          field="quantity"
          header="Quantity"
          editor={quantityEditor}
          style={{ minWidth: '120px' }}
        />
        <Column
          rowEditor
          headerStyle={{ width: '10%', minWidth: '8rem' }}
          bodyStyle={{ textAlign: 'center', overflow: 'visible' }}
        >
          {({ rowEditor }) => (
            <>
              {rowEditor.initButton}
              {rowEditor.saveButton}
              {rowEditor.cancelButton}
            </>
          )}
        </Column>
      </DataTable>
    </div>
  );
}

export default Assets;
