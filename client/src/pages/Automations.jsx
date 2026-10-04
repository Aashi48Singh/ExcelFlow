// // // import { useEffect, useState } from 'react';
// // // import { Copy, Pencil, Play, Plus, Trash2 } from 'lucide-react';
// // // import FormulaBuilder from '../components/FormulaBuilder.jsx';
// // // import { Empty, FileSelect, Notice, PageHeader } from '../components/ui.jsx';
// // // import { automationApi, fileApi, errorMessage } from '../services/api.js';
// // // import { describeRule } from '../utils/describeRule.js';
// // // import { formatDate } from '../utils/format.js';

// // // export default function Automations() {
// // //   const [items, setItems] = useState(null);
// // //   const [files, setFiles] = useState([]);
// // //   const [editor, setEditor] = useState(null); // { id?, name, description, rules }
// // //   const [runFor, setRunFor] = useState(null); // automation being run
// // //   const [fileId, setFileId] = useState('');
// // //   const [notice, setNotice] = useState(null);
// // //   const [busy, setBusy] = useState(false);

// // //   const load = () => automationApi.list().then(setItems).catch((e) => setNotice({ type: 'error', text: errorMessage(e) }));
// // //   useEffect(() => { load(); fileApi.list().then(setFiles).catch(() => {}); }, []);

// // //   const wrap = async (fn, okText) => {
// // //     setBusy(true); setNotice(null);
// // //     try { const r = await fn(); if (okText) setNotice({ type: 'success', text: typeof okText === 'function' ? okText(r) : okText }); await load(); return true; }
// // //     catch (e) { setNotice({ type: 'error', text: errorMessage(e) }); return false; } finally { setBusy(false); }
// // //   };
// // //   const saveEditor = async () => {
// // //     const payload = { name: editor.name, description: editor.description, rules: editor.rules };
// // //     const ok = await wrap(() => (editor.id ? automationApi.update(editor.id, payload) : automationApi.create(payload)), 'Automation saved.');
// // //     if (ok) setEditor(null);
// // //   };
// // //   const runIt = async () => {
// // //     const ok = await wrap(() => automationApi.run(runFor._id, fileId), (r) => [`Processed ${r.rowCount} rows with “${runFor.name}”.`, ...r.messages]);
// // //     if (ok) setRunFor(null);
// // //   };
// // //   const addStep = (rule, err) => (err ? setNotice({ type: 'error', text: err }) : setEditor((e) => ({ ...e, rules: [...e.rules, rule] })));

// // //   return (
// // //     <>
// // //       <PageHeader title="Automations" subtitle="Reusable workflows you can run on any compatible file.">
// // //         <button className="btn-primary" onClick={() => setEditor({ name: '', description: '', rules: [] })}><Plus size={14} /> New automation</button>
// // //       </PageHeader>
// // //       <div className="mb-4"><Notice notice={notice} onClose={() => setNotice(null)} /></div>

// // //       {editor && (
// // //         <div className="card mb-6 space-y-4">
// // //           <h2 className="font-semibold">{editor.id ? 'Edit automation' : 'New automation'}</h2>
// // //           <div className="grid gap-3 sm:grid-cols-2">
// // //             <div><label className="label">Name</label><input className="input" value={editor.name} onChange={(e) => setEditor({ ...editor, name: e.target.value })} placeholder="Employee Payroll Automation" /></div>
// // //             <div><label className="label">Description</label><input className="input" value={editor.description} onChange={(e) => setEditor({ ...editor, description: e.target.value })} /></div>
// // //           </div>
// // //           <ol className="space-y-1.5">
// // //             {editor.rules.map((r, i) => (
// // //               <li key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
// // //                 <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-xs text-white">{i + 1}</span>
// // //                 <span className="flex-1 break-words">{describeRule(r)}</span>
// // //                 <button onClick={() => setEditor({ ...editor, rules: editor.rules.filter((_, j) => j !== i) })} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
// // //               </li>
// // //             ))}
// // //             {!editor.rules.length && <li className="text-sm text-slate-500">Add steps below. Column names are typed in and matched when the automation runs.</li>}
// // //           </ol>
// // //           <TextColumnBuilder onAdd={addStep} />
// // //           <div className="flex gap-2">
// // //             <button className="btn-primary" disabled={busy} onClick={saveEditor}>Save automation</button>
// // //             <button className="btn-ghost" onClick={() => setEditor(null)}>Cancel</button>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {runFor && (
// // //         <div className="card mb-6 space-y-3">
// // //           <h2 className="font-semibold">Run “{runFor.name}”</h2>
// // //           <p className="text-sm text-slate-500">The result replaces the file’s current data. A copy of the output is kept in History.</p>
// // //           <FileSelect files={files} value={fileId} onChange={setFileId} />
// // //           <div className="flex gap-2"><button className="btn-primary" disabled={!fileId || busy} onClick={runIt}>{busy ? 'Running…' : 'Run now'}</button><button className="btn-ghost" onClick={() => setRunFor(null)}>Cancel</button></div>
// // //         </div>
// // //       )}

// // //       {items && !items.length && !editor && <Empty>No saved automations yet.</Empty>}
// // //       <div className="grid gap-4 lg:grid-cols-2">
// // //         {items?.map((a) => (
// // //           <div key={a._id} className="card">
// // //             <div className="flex items-start justify-between gap-2">
// // //               <div><h3 className="font-semibold">{a.name}</h3><p className="text-sm text-slate-500">{a.description || 'No description'}</p></div>
// // //               <span className="whitespace-nowrap text-xs text-slate-400">{formatDate(a.updatedAt)}</span>
// // //             </div>
// // //             <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-slate-600">{a.rules.map((r, i) => <li key={i}>{describeRule(r)}</li>)}</ol>
// // //             <div className="mt-4 flex flex-wrap gap-2">
// // //               <button className="btn-primary" onClick={() => { setRunFor(a); setFileId(''); }}><Play size={14} /> Run</button>
// // //               <button className="btn-outline" onClick={() => { setEditor({ id: a._id, name: a.name, description: a.description, rules: a.rules }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Pencil size={14} /> Edit</button>
// // //               <button className="btn-outline" onClick={() => wrap(() => automationApi.duplicate(a._id), 'Automation duplicated.')}><Copy size={14} /> Duplicate</button>
// // //               <button className="btn-danger" onClick={() => window.confirm(`Delete “${a.name}”?`) && wrap(() => automationApi.remove(a._id), 'Automation deleted.')}><Trash2 size={14} /> Delete</button>
// // //             </div>
// // //           </div>
// // //         ))}
// // //       </div>
// // //     </>
// // //   );
// // // }

// // // /** Builder variant without a loaded file: lets the user choose a sample file's columns, or type names. */
// // // function TextColumnBuilder({ onAdd }) {
// // //   const [files, setFiles] = useState([]);
// // //   const [fileId, setFileId] = useState('');
// // //   const [columns, setColumns] = useState([]);
// // //   useEffect(() => { fileApi.list().then(setFiles).catch(() => {}); }, []);
// // //   useEffect(() => { if (fileId) fileApi.get(fileId).then((f) => setColumns(f.columns)).catch(() => {}); else setColumns([]); }, [fileId]);
// // //   return (
// // //     <div className="space-y-2">
// // //       <div className="max-w-sm"><label className="label">Use columns from a file (optional)</label><FileSelect files={files} value={fileId} onChange={setFileId} placeholder="Pick a sample file…" /></div>
// // //       {columns.length > 0 ? <FormulaBuilder columns={columns} onApply={onAdd} onAdd={onAdd} busy={false} /> : <p className="text-sm text-slate-500">Select a sample file above to build steps with the visual builder.</p>}
// // //     </div>
// // //   );
// // // }

// // import { useEffect, useMemo, useState } from "react";
// // import {
// //   CheckCircle2,
// //   Copy,
// //   FileSpreadsheet,
// //   Pencil,
// //   Play,
// //   Plus,
// //   Save,
// //   Trash2,
// //   Workflow,
// //   X,
// // } from "lucide-react";

// // import FormulaBuilder from "../components/FormulaBuilder.jsx";
// // import {
// //   Empty,
// //   FileSelect,
// //   Notice,
// //   PageHeader,
// // } from "../components/ui.jsx";

// // import {
// //   automationApi,
// //   fileApi,
// //   errorMessage,
// // } from "../services/api.js";

// // import { describeRule } from "../utils/describeRule.js";
// // import { formatDate } from "../utils/format.js";

// // export default function Automations() {
// //   const [items, setItems] = useState(null);
// //   const [files, setFiles] = useState([]);

// //   const [editor, setEditor] = useState(null);

// //   const [runFor, setRunFor] = useState(null);
// //   const [fileId, setFileId] = useState("");

// //   const [notice, setNotice] = useState(null);
// //   const [busy, setBusy] = useState(false);

// //   const load = async () => {
// //     try {
// //       const data = await automationApi.list();
// //       setItems(data);
// //     } catch (err) {
// //       setNotice({
// //         type: "error",
// //         text: errorMessage(err),
// //       });
// //     }
// //   };

// //   const loadFiles = async () => {
// //     try {
// //       const data = await fileApi.list();
// //       setFiles(data);
// //     } catch {
// //       setFiles([]);
// //     }
// //   };

// //   useEffect(() => {
// //     load();
// //     loadFiles();
// //   }, []);

// //   const wrap = async (fn, successMessage) => {
// //     setBusy(true);
// //     setNotice(null);

// //     try {
// //       const result = await fn();

// //       if (successMessage) {
// //         const message =
// //           typeof successMessage === "function"
// //             ? successMessage(result)
// //             : successMessage;

// //         setNotice({
// //           type: "success",
// //           text: message,
// //         });
// //       }

// //       await load();

// //       return true;
// //     } catch (err) {
// //       setNotice({
// //         type: "error",
// //         text: errorMessage(err),
// //       });

// //       return false;
// //     } finally {
// //       setBusy(false);
// //     }
// //   };

// //   const createAutomation = () => {
// //     setNotice(null);

// //     setEditor({
// //       name: "",
// //       description: "",
// //       rules: [],
// //       sourceFileId: "",
// //     });

// //     window.scrollTo({
// //       top: 0,
// //       behavior: "smooth",
// //     });
// //   };

// //   const editAutomation = (automation) => {
// //     setNotice(null);

// //     setEditor({
// //       id: automation._id,
// //       name: automation.name || "",
// //       description: automation.description || "",
// //       rules: automation.rules || [],
// //       sourceFileId: "",
// //     });

// //     window.scrollTo({
// //       top: 0,
// //       behavior: "smooth",
// //     });
// //   };

// //   const saveEditor = async () => {
// //     if (!editor.name.trim()) {
// //       setNotice({
// //         type: "error",
// //         text: "Please enter an automation name.",
// //       });
// //       return;
// //     }

// //     if (!editor.rules.length) {
// //       setNotice({
// //         type: "error",
// //         text: "Add at least one automation step before saving.",
// //       });
// //       return;
// //     }

// //     const payload = {
// //       name: editor.name.trim(),
// //       description: editor.description.trim(),
// //       rules: editor.rules,
// //     };

// //     const ok = await wrap(
// //       () =>
// //         editor.id
// //           ? automationApi.update(editor.id, payload)
// //           : automationApi.create(payload),
// //       "Automation saved successfully."
// //     );

// //     if (ok) {
// //       setEditor(null);
// //     }
// //   };

// //   const addStep = (rule, err) => {
// //     if (err) {
// //       setNotice({
// //         type: "error",
// //         text: err,
// //       });
// //       return;
// //     }

// //     if (!rule) {
// //       setNotice({
// //         type: "error",
// //         text: "Unable to create automation step.",
// //       });
// //       return;
// //     }

// //     setEditor((current) => ({
// //       ...current,
// //       rules: [...current.rules, rule],
// //     }));

// //     setNotice({
// //       type: "success",
// //       text: "Automation step added.",
// //     });
// //   };

// //   const removeStep = (index) => {
// //     setEditor((current) => ({
// //       ...current,
// //       rules: current.rules.filter((_, i) => i !== index),
// //     }));
// //   };

// //   const moveStep = (index, direction) => {
// //     setEditor((current) => {
// //       const rules = [...current.rules];

// //       const newIndex =
// //         direction === "up"
// //           ? index - 1
// //           : index + 1;

// //       if (
// //         newIndex < 0 ||
// //         newIndex >= rules.length
// //       ) {
// //         return current;
// //       }

// //       [rules[index], rules[newIndex]] = [
// //         rules[newIndex],
// //         rules[index],
// //       ];

// //       return {
// //         ...current,
// //         rules,
// //       };
// //     });
// //   };

// //   const runIt = async () => {
// //     if (!fileId) {
// //       setNotice({
// //         type: "error",
// //         text: "Please select a file to process.",
// //       });
// //       return;
// //     }

// //     const ok = await wrap(
// //       () =>
// //         automationApi.run(
// //           runFor._id,
// //           fileId
// //         ),
// //       (result) => {
// //         const messages = Array.isArray(result?.messages)
// //           ? result.messages
// //           : [];

// //         return [
// //           `Automation completed successfully.`,
// //           `Processed ${result?.rowCount ?? 0} rows.`,
// //           ...messages,
// //         ];
// //       }
// //     );

// //     if (ok) {
// //       setRunFor(null);
// //       setFileId("");
// //     }
// //   };

// //   const totalSteps = editor?.rules?.length || 0;

// //   return (
// //     <>
// //       <PageHeader
// //         title="Automations"
// //         subtitle="Build reusable workflows that process your Excel data automatically."
// //       >
// //         <button
// //           className="btn-primary"
// //           onClick={createAutomation}
// //         >
// //           <Plus size={16} />
// //           New automation
// //         </button>
// //       </PageHeader>

// //       <div className="mb-5">
// //         <Notice
// //           notice={notice}
// //           onClose={() => setNotice(null)}
// //         />
// //       </div>

// //       {/* =========================
// //           AUTOMATION EDITOR
// //       ========================== */}

// //       {editor && (
// //         <div className="card mb-6 overflow-hidden">
// //           {/* Header */}
// //           <div className="border-b border-slate-200 pb-5">
// //             <div className="flex items-start justify-between gap-4">
// //               <div className="flex items-start gap-3">
// //                 <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
// //                   <Workflow size={22} />
// //                 </div>

// //                 <div>
// //                   <h2 className="text-xl font-semibold text-slate-900">
// //                     {editor.id
// //                       ? "Edit automation"
// //                       : "Create automation"}
// //                   </h2>

// //                   <p className="mt-1 text-sm text-slate-500">
// //                     Create multiple steps and run them automatically
// //                     on compatible Excel files.
// //                   </p>
// //                 </div>
// //               </div>

// //               <button
// //                 type="button"
// //                 className="text-slate-400 hover:text-slate-700"
// //                 onClick={() => setEditor(null)}
// //               >
// //                 <X size={20} />
// //               </button>
// //             </div>
// //           </div>

// //           {/* Basic information */}
// //           <div className="mt-5 grid gap-4 md:grid-cols-2">
// //             <div>
// //               <label className="label">
// //                 Automation name
// //               </label>

// //               <input
// //                 className="input"
// //                 value={editor.name}
// //                 onChange={(e) =>
// //                   setEditor({
// //                     ...editor,
// //                     name: e.target.value,
// //                   })
// //                 }
// //                 placeholder="Employee Payroll Automation"
// //               />
// //             </div>

// //             <div>
// //               <label className="label">
// //                 Description
// //               </label>

// //               <input
// //                 className="input"
// //                 value={editor.description}
// //                 onChange={(e) =>
// //                   setEditor({
// //                     ...editor,
// //                     description: e.target.value,
// //                   })
// //                 }
// //                 placeholder="Automatically process employee payroll data"
// //               />
// //             </div>
// //           </div>

// //           {/* Workflow status */}
// //           <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
// //             <div className="flex flex-wrap items-center justify-between gap-3">
// //               <div>
// //                 <h3 className="font-semibold text-slate-900">
// //                   Automation workflow
// //                 </h3>

// //                 <p className="text-sm text-slate-500">
// //                   Add steps in the order they should run.
// //                 </p>
// //               </div>

// //               <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
// //                 {totalSteps}{" "}
// //                 {totalSteps === 1 ? "step" : "steps"}
// //               </div>
// //             </div>
// //           </div>

// //           {/* Existing steps */}
// //           <div className="mt-5">
// //             {editor.rules.length > 0 ? (
// //               <div className="space-y-3">
// //                 {editor.rules.map((rule, index) => (
// //                   <AutomationStep
// //                     key={`${index}-${JSON.stringify(rule)}`}
// //                     rule={rule}
// //                     index={index}
// //                     total={editor.rules.length}
// //                     onRemove={() => removeStep(index)}
// //                     onMoveUp={() =>
// //                       moveStep(index, "up")
// //                     }
// //                     onMoveDown={() =>
// //                       moveStep(index, "down")
// //                     }
// //                   />
// //                 ))}
// //               </div>
// //             ) : (
// //               <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
// //                 <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
// //                   <Plus size={22} />
// //                 </div>

// //                 <h3 className="mt-3 font-semibold text-slate-800">
// //                   No automation steps yet
// //                 </h3>

// //                 <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
// //                   Add your first calculation, validation,
// //                   cleaning, condition, or other automation step
// //                   below.
// //                 </p>
// //               </div>
// //             )}
// //           </div>

// //           {/* Builder */}
// //           <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/30 p-5">
// //             <div className="mb-4">
// //               <h3 className="font-semibold text-slate-900">
// //                 Add automation step
// //               </h3>

// //               <p className="mt-1 text-sm text-slate-500">
// //                 Select a file to load its columns, then choose
// //                 the operation you want ExcelFlow to perform.
// //               </p>
// //             </div>

// //             <TextColumnBuilder
// //               onAdd={addStep}
// //             />
// //           </div>

// //           {/* Save */}
// //           <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
// //             <button
// //               className="btn-primary"
// //               disabled={busy}
// //               onClick={saveEditor}
// //             >
// //               <Save size={15} />

// //               {busy
// //                 ? "Saving..."
// //                 : editor.id
// //                   ? "Update automation"
// //                   : "Save automation"}
// //             </button>

// //             <button
// //               className="btn-ghost"
// //               onClick={() => setEditor(null)}
// //               disabled={busy}
// //             >
// //               Cancel
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* =========================
// //           RUN AUTOMATION
// //       ========================== */}

// //       {runFor && (
// //         <div className="card mb-6 border-brand-200">
// //           <div className="flex items-start gap-3">
// //             <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
// //               <Play size={18} />
// //             </div>

// //             <div>
// //               <h2 className="font-semibold text-slate-900">
// //                 Run "{runFor.name}"
// //               </h2>

// //               <p className="mt-1 text-sm text-slate-500">
// //                 Select the Excel file that should be processed
// //                 by this automation.
// //               </p>
// //             </div>
// //           </div>

// //           <div className="mt-5">
// //             <label className="label">
// //               Select input file
// //             </label>

// //             <FileSelect
// //               files={files}
// //               value={fileId}
// //               onChange={setFileId}
// //               placeholder="Choose an Excel or CSV file..."
// //             />
// //           </div>

// //           <div className="mt-5 flex flex-wrap gap-2">
// //             <button
// //               className="btn-primary"
// //               disabled={!fileId || busy}
// //               onClick={runIt}
// //             >
// //               <Play size={15} />

// //               {busy
// //                 ? "Running automation..."
// //                 : "Run automation"}
// //             </button>

// //             <button
// //               className="btn-ghost"
// //               onClick={() => {
// //                 setRunFor(null);
// //                 setFileId("");
// //               }}
// //             >
// //               Cancel
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* =========================
// //           SAVED AUTOMATIONS
// //       ========================== */}

// //       {items && !items.length && !editor && (
// //         <Empty>
// //           No saved automations yet. Create your first workflow
// //           using the "New automation" button.
// //         </Empty>
// //       )}

// //       <div className="grid gap-5 lg:grid-cols-2">
// //         {items?.map((automation) => (
// //           <AutomationCard
// //             key={automation._id}
// //             automation={automation}
// //             onRun={() => {
// //               setRunFor(automation);
// //               setFileId("");
// //             }}
// //             onEdit={() =>
// //               editAutomation(automation)
// //             }
// //             onDuplicate={() =>
// //               wrap(
// //                 () =>
// //                   automationApi.duplicate(
// //                     automation._id
// //                   ),
// //                 "Automation duplicated successfully."
// //               )
// //             }
// //             onDelete={() =>
// //               window.confirm(
// //                 `Delete "${automation.name}"?`
// //               ) &&
// //               wrap(
// //                 () =>
// //                   automationApi.remove(
// //                     automation._id
// //                   ),
// //                 "Automation deleted successfully."
// //               )
// //             }
// //           />
// //         ))}
// //       </div>
// //     </>
// //   );
// // }

// // /* =====================================================
// //    AUTOMATION STEP
// // ===================================================== */

// // function AutomationStep({
// //   rule,
// //   index,
// //   total,
// //   onRemove,
// //   onMoveUp,
// //   onMoveDown,
// // }) {
// //   const description = useMemo(
// //     () => describeRule(rule),
// //     [rule]
// //   );

// //   return (
// //     <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
// //       <div className="flex items-start gap-3">
// //         <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
// //           {index + 1}
// //         </div>

// //         <div className="min-w-0 flex-1">
// //           <div className="flex flex-wrap items-center gap-2">
// //             <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">
// //               Step {index + 1}
// //             </span>

// //             <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
// //               Automation rule
// //             </span>
// //           </div>

// //           <p className="mt-1 break-words text-sm font-medium text-slate-800">
// //             {description}
// //           </p>
// //         </div>

// //         <div className="flex shrink-0 items-center gap-1">
// //           <button
// //             type="button"
// //             disabled={index === 0}
// //             onClick={onMoveUp}
// //             className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
// //             title="Move up"
// //           >
// //             ↑
// //           </button>

// //           <button
// //             type="button"
// //             disabled={index === total - 1}
// //             onClick={onMoveDown}
// //             className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
// //             title="Move down"
// //           >
// //             ↓
// //           </button>

// //           <button
// //             type="button"
// //             onClick={onRemove}
// //             className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
// //             title="Remove step"
// //           >
// //             <Trash2 size={15} />
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // /* =====================================================
// //    AUTOMATION CARD
// // ===================================================== */

// // function AutomationCard({
// //   automation,
// //   onRun,
// //   onEdit,
// //   onDuplicate,
// //   onDelete,
// // }) {
// //   const rules = automation.rules || [];

// //   return (
// //     <div className="card transition-shadow hover:shadow-md">
// //       <div className="flex items-start justify-between gap-3">
// //         <div className="flex min-w-0 items-start gap-3">
// //           <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
// //             <Workflow size={19} />
// //           </div>

// //           <div className="min-w-0">
// //             <h3 className="font-semibold text-slate-900">
// //               {automation.name}
// //             </h3>

// //             <p className="mt-1 text-sm text-slate-500">
// //               {automation.description ||
// //                 "No description provided."}
// //             </p>
// //           </div>
// //         </div>

// //         <span className="whitespace-nowrap text-xs text-slate-400">
// //           {formatDate(automation.updatedAt)}
// //         </span>
// //       </div>

// //       {/* Steps */}
// //       <div className="mt-4 rounded-lg bg-slate-50 p-3">
// //         <div className="mb-2 flex items-center justify-between">
// //           <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
// //             Workflow
// //           </span>

// //           <span className="text-xs text-slate-400">
// //             {rules.length}{" "}
// //             {rules.length === 1
// //               ? "step"
// //               : "steps"}
// //           </span>
// //         </div>

// //         {rules.length ? (
// //           <ol className="space-y-2">
// //             {rules.map((rule, index) => (
// //               <li
// //                 key={index}
// //                 className="flex items-start gap-2 text-sm text-slate-600"
// //               >
// //                 <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[10px] font-semibold text-brand-700 shadow-sm">
// //                   {index + 1}
// //                 </span>

// //                 <span className="break-words">
// //                   {describeRule(rule)}
// //                 </span>
// //               </li>
// //             ))}
// //           </ol>
// //         ) : (
// //           <p className="text-sm text-slate-400">
// //             No steps configured.
// //           </p>
// //         )}
// //       </div>

// //       {/* Actions */}
// //       <div className="mt-4 flex flex-wrap gap-2">
// //         <button
// //           className="btn-primary"
// //           onClick={onRun}
// //         >
// //           <Play size={14} />
// //           Run
// //         </button>

// //         <button
// //           className="btn-outline"
// //           onClick={onEdit}
// //         >
// //           <Pencil size={14} />
// //           Edit
// //         </button>

// //         <button
// //           className="btn-outline"
// //           onClick={onDuplicate}
// //         >
// //           <Copy size={14} />
// //           Duplicate
// //         </button>

// //         <button
// //           className="btn-danger"
// //           onClick={onDelete}
// //         >
// //           <Trash2 size={14} />
// //           Delete
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// // /* =====================================================
// //    COLUMN / FORMULA BUILDER
// // ===================================================== */

// // function TextColumnBuilder({ onAdd }) {
// //   const [files, setFiles] = useState([]);
// //   const [fileId, setFileId] = useState("");
// //   const [columns, setColumns] = useState([]);
// //   const [loadingColumns, setLoadingColumns] =
// //     useState(false);

// //   useEffect(() => {
// //     fileApi
// //       .list()
// //       .then(setFiles)
// //       .catch(() => setFiles([]));
// //   }, []);

// //   useEffect(() => {
// //     if (!fileId) {
// //       setColumns([]);
// //       return;
// //     }

// //     setLoadingColumns(true);

// //     fileApi
// //       .get(fileId)
// //       .then((file) => {
// //         setColumns(
// //           Array.isArray(file?.columns)
// //             ? file.columns
// //             : []
// //         );
// //       })
// //       .catch(() => {
// //         setColumns([]);
// //       })
// //       .finally(() => {
// //         setLoadingColumns(false);
// //       });
// //   }, [fileId]);

// //   return (
// //     <div>
// //       {/* Source file */}
// //       <div className="max-w-xl">
// //         <label className="label">
// //           Use columns from a file
// //         </label>

// //         <FileSelect
// //           files={files}
// //           value={fileId}
// //           onChange={setFileId}
// //           placeholder="Select a sample Excel/CSV file..."
// //         />
// //       </div>

// //       {/* File information */}
// //       {fileId && !loadingColumns && (
// //         <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
// //           <CheckCircle2 size={16} />

// //           <span>
// //             {columns.length} column
// //             {columns.length === 1
// //               ? ""
// //               : "s"}{" "}
// //             loaded from the selected file.
// //           </span>
// //         </div>
// //       )}

// //       {loadingColumns && (
// //         <div className="mt-4 text-sm text-slate-500">
// //           Loading columns...
// //         </div>
// //       )}

// //       {/* Formula builder */}
// //       <div className="mt-5">
// //         {columns.length > 0 ? (
// //           <FormulaBuilder
// //             columns={columns}
// //             onApply={onAdd}
// //             onAdd={onAdd}
// //             busy={loadingColumns}
// //           />
// //         ) : (
// //           <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
// //             <FileSpreadsheet
// //               size={28}
// //               className="mx-auto text-slate-400"
// //             />

// //             <h4 className="mt-3 font-medium text-slate-800">
// //               Select a source file
// //             </h4>

// //             <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
// //               ExcelFlow will load the column names from your
// //               Excel/CSV file so you can create automation
// //               rules without typing column names manually.
// //             </p>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
// import { useEffect, useMemo, useState } from "react";

// import {
//   CheckCircle2,
//   Copy,
//   FileSpreadsheet,
//   Pencil,
//   Play,
//   Plus,
//   Save,
//   Trash2,
//   Workflow,
//   X,
// } from "lucide-react";

// import FormulaBuilder from "../components/FormulaBuilder.jsx";

// import {
//   Empty,
//   FileSelect,
//   Notice,
//   PageHeader,
// } from "../components/ui.jsx";

// import {
//   automationApi,
//   fileApi,
//   errorMessage,
// } from "../services/api.js";

// import { describeRule } from "../utils/describeRule.js";
// import { formatDate } from "../utils/format.js";


// /* =====================================================
//    MAIN AUTOMATIONS PAGE
// ===================================================== */

// export default function Automations() {
//   const [items, setItems] = useState(null);
//   const [files, setFiles] = useState([]);

//   const [editor, setEditor] = useState(null);

//   const [runFor, setRunFor] = useState(null);
//   const [fileId, setFileId] = useState("");

//   const [notice, setNotice] = useState(null);
//   const [busy, setBusy] = useState(false);

//   /* =====================================================
//      LOAD AUTOMATIONS
//   ===================================================== */

//   const load = async () => {
//     try {
//       const data = await automationApi.list();

//       setItems(data);
//     } catch (err) {
//       setNotice({
//         type: "error",
//         text: errorMessage(err),
//       });
//     }
//   };

//   /* =====================================================
//      LOAD FILES
//   ===================================================== */

//   const loadFiles = async () => {
//     try {
//       const data = await fileApi.list();

//       setFiles(data);
//     } catch {
//       setFiles([]);
//     }
//   };

//   useEffect(() => {
//     load();
//     loadFiles();
//   }, []);

//   /* =====================================================
//      COMMON ACTION WRAPPER
//   ===================================================== */

//   const wrap = async (fn, successMessage) => {
//     setBusy(true);
//     setNotice(null);

//     try {
//       const result = await fn();

//       if (successMessage) {
//         const message =
//           typeof successMessage === "function"
//             ? successMessage(result)
//             : successMessage;

//         setNotice({
//           type: "success",
//           text: message,
//         });
//       }

//       await load();

//       return true;
//     } catch (err) {
//       setNotice({
//         type: "error",
//         text: errorMessage(err),
//       });

//       return false;
//     } finally {
//       setBusy(false);
//     }
//   };

//   /* =====================================================
//      CREATE AUTOMATION
//   ===================================================== */

//   const createAutomation = () => {
//     setNotice(null);

//     setEditor({
//       name: "",
//       description: "",
//       rules: [],
//       sourceFileId: "",
//     });

//     window.scrollTo({
//       top: 0,
//       behavior: "smooth",
//     });
//   };

//   /* =====================================================
//      EDIT AUTOMATION
//   ===================================================== */

//   const editAutomation = (automation) => {
//     setNotice(null);

//     setEditor({
//       id: automation._id,
//       name: automation.name || "",
//       description: automation.description || "",
//       rules: automation.rules || [],
//       sourceFileId: "",
//     });

//     window.scrollTo({
//       top: 0,
//       behavior: "smooth",
//     });
//   };

//   /* =====================================================
//      SAVE AUTOMATION
//   ===================================================== */

//   const saveEditor = async () => {
//     if (!editor.name.trim()) {
//       setNotice({
//         type: "error",
//         text: "Please enter an automation name.",
//       });

//       return;
//     }

//     if (!editor.rules.length) {
//       setNotice({
//         type: "error",
//         text: "Add at least one automation step before saving.",
//       });

//       return;
//     }

//     const payload = {
//       name: editor.name.trim(),
//       description: editor.description.trim(),
//       rules: editor.rules,
//     };

//     const ok = await wrap(
//       () =>
//         editor.id
//           ? automationApi.update(
//               editor.id,
//               payload
//             )
//           : automationApi.create(payload),
//       "Automation saved successfully."
//     );

//     if (ok) {
//       setEditor(null);
//     }
//   };

//   /* =====================================================
//      ADD AUTOMATION STEP
//   ===================================================== */

//   const addStep = (rule, err) => {
//     if (err) {
//       setNotice({
//         type: "error",
//         text: err,
//       });

//       return;
//     }

//     if (!rule) {
//       setNotice({
//         type: "error",
//         text: "Unable to create automation step.",
//       });

//       return;
//     }

//     setEditor((current) => ({
//       ...current,
//       rules: [
//         ...current.rules,
//         rule,
//       ],
//     }));

//     setNotice({
//       type: "success",
//       text: "Automation step added.",
//     });
//   };

//   /* =====================================================
//      REMOVE STEP
//   ===================================================== */

//   const removeStep = (index) => {
//     setEditor((current) => ({
//       ...current,
//       rules: current.rules.filter(
//         (_, i) => i !== index
//       ),
//     }));
//   };

//   /* =====================================================
//      MOVE STEP
//   ===================================================== */

//   const moveStep = (
//     index,
//     direction
//   ) => {
//     setEditor((current) => {
//       const rules = [
//         ...current.rules,
//       ];

//       const newIndex =
//         direction === "up"
//           ? index - 1
//           : index + 1;

//       if (
//         newIndex < 0 ||
//         newIndex >= rules.length
//       ) {
//         return current;
//       }

//       [
//         rules[index],
//         rules[newIndex],
//       ] = [
//         rules[newIndex],
//         rules[index],
//       ];

//       return {
//         ...current,
//         rules,
//       };
//     });
//   };

//   /* =====================================================
//      FORMAT AUTOMATION RESULT
//   ===================================================== */

//   const formatAutomationResult = (
//     result
//   ) => {
//     const results = Array.isArray(
//       result?.results
//     )
//       ? result.results
//       : [];

//     return results.map(
//       (item) => {
//         let label = String(
//           item?.label || "Result"
//         );

//         /*
//          * Convert backend labels such as:
//          *
//          * AVERAGE of Salary
//          *
//          * into:
//          *
//          * Average Salary
//          */

//         label = label
//           .replace(
//             /^AVERAGE\s+OF\s+/i,
//             "Average "
//           )
//           .replace(
//             /^SUM\s+OF\s+/i,
//             "Total "
//           )
//           .replace(
//             /^MIN\s+OF\s+/i,
//             "Minimum "
//           )
//           .replace(
//             /^MAX\s+OF\s+/i,
//             "Maximum "
//           )
//           .replace(
//             /^COUNT\s+OF\s+/i,
//             "Count "
//           );

//         const rawValue =
//           item?.value;

//         let value = rawValue;

//         /*
//          * Format numbers using Indian
//          * number formatting.
//          *
//          * Example:
//          * 35666.666
//          *
//          * becomes:
//          * 35,666.67
//          */

//         if (
//           typeof rawValue ===
//           "number"
//         ) {
//           value =
//             rawValue.toLocaleString(
//               "en-IN",
//               {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               }
//             );
//         }

//         /*
//          * Currency display
//          */

//         return {
//           label,
//           value,
//           isNumber:
//             typeof rawValue ===
//             "number",
//         };
//       }
//     );
//   };

//   /* =====================================================
//      RUN AUTOMATION
//   ===================================================== */

//   const runIt = async () => {
//     if (!fileId) {
//       setNotice({
//         type: "error",
//         text: "Please select a file to process.",
//       });

//       return;
//     }

//     const ok = await wrap(
//       () =>
//         automationApi.run(
//           runFor._id,
//           fileId
//         ),

//       (result) => {
//         const messages =
//           Array.isArray(
//             result?.messages
//           )
//             ? result.messages
//             : [];

//         const calculatedResults =
//           formatAutomationResult(
//             result
//           );

//         /*
//          * Build readable result text.
//          */

//         const resultMessages =
//           calculatedResults.map(
//             (item) =>
//               `${item.label}: ₹${item.value}`
//           );

//         return [
//           "Automation completed successfully.",

//           `Processed ${
//             result?.rowCount ?? 0
//           } rows.`,

//           ...resultMessages,

//           ...messages,
//         ];
//       }
//     );

//     if (ok) {
//       setRunFor(null);
//       setFileId("");
//     }
//   };

//   const totalSteps =
//     editor?.rules?.length || 0;

//   return (
//     <>
//       {/* =================================================
//           PAGE HEADER
//       ================================================= */}

//       <PageHeader
//         title="Automations"
//         subtitle="Build reusable workflows that process your Excel data automatically."
//       >
//         <button
//           className="btn-primary"
//           onClick={
//             createAutomation
//           }
//         >
//           <Plus size={16} />

//           New automation
//         </button>
//       </PageHeader>

//       {/* =================================================
//           NOTIFICATION
//       ================================================= */}

//       <div className="mb-5">
//         <Notice
//           notice={notice}
//           onClose={() =>
//             setNotice(null)
//           }
//         />
//       </div>

//       {/* =================================================
//           AUTOMATION EDITOR
//       ================================================= */}

//       {editor && (
//         <div className="card mb-6 overflow-hidden">

//           {/* Header */}

//           <div className="border-b border-slate-200 pb-5">

//             <div className="flex items-start justify-between gap-4">

//               <div className="flex items-start gap-3">

//                 <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
//                   <Workflow
//                     size={22}
//                   />
//                 </div>

//                 <div>

//                   <h2 className="text-xl font-semibold text-slate-900">
//                     {editor.id
//                       ? "Edit automation"
//                       : "Create automation"}
//                   </h2>

//                   <p className="mt-1 text-sm text-slate-500">
//                     Create multiple steps and run them automatically
//                     on compatible Excel files.
//                   </p>

//                 </div>
//               </div>

//               <button
//                 type="button"
//                 className="text-slate-400 hover:text-slate-700"
//                 onClick={() =>
//                   setEditor(null)
//                 }
//               >
//                 <X size={20} />
//               </button>

//             </div>

//           </div>

//           {/* Basic information */}

//           <div className="mt-5 grid gap-4 md:grid-cols-2">

//             <div>

//               <label className="label">
//                 Automation name
//               </label>

//               <input
//                 className="input"
//                 value={
//                   editor.name
//                 }
//                 onChange={(e) =>
//                   setEditor({
//                     ...editor,
//                     name:
//                       e.target.value,
//                   })
//                 }
//                 placeholder="Employee Payroll Automation"
//               />

//             </div>

//             <div>

//               <label className="label">
//                 Description
//               </label>

//               <input
//                 className="input"
//                 value={
//                   editor.description
//                 }
//                 onChange={(e) =>
//                   setEditor({
//                     ...editor,
//                     description:
//                       e.target.value,
//                   })
//                 }
//                 placeholder="Automatically process employee payroll data"
//               />

//             </div>

//           </div>

//           {/* Workflow status */}

//           <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">

//             <div className="flex flex-wrap items-center justify-between gap-3">

//               <div>

//                 <h3 className="font-semibold text-slate-900">
//                   Automation workflow
//                 </h3>

//                 <p className="text-sm text-slate-500">
//                   Add steps in the order they should run.
//                 </p>

//               </div>

//               <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">

//                 {totalSteps}{" "}

//                 {totalSteps ===
//                 1
//                   ? "step"
//                   : "steps"}

//               </div>

//             </div>

//           </div>

//           {/* Existing steps */}

//           <div className="mt-5">

//             {editor.rules.length >
//             0 ? (

//               <div className="space-y-3">

//                 {editor.rules.map(
//                   (
//                     rule,
//                     index
//                   ) => (

//                     <AutomationStep
//                       key={`${index}-${JSON.stringify(
//                         rule
//                       )}`}
//                       rule={
//                         rule
//                       }
//                       index={
//                         index
//                       }
//                       total={
//                         editor
//                           .rules
//                           .length
//                       }
//                       onRemove={() =>
//                         removeStep(
//                           index
//                         )
//                       }
//                       onMoveUp={() =>
//                         moveStep(
//                           index,
//                           "up"
//                         )
//                       }
//                       onMoveDown={() =>
//                         moveStep(
//                           index,
//                           "down"
//                         )
//                       }
//                     />

//                   )
//                 )}

//               </div>

//             ) : (

//               <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">

//                 <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">

//                   <Plus
//                     size={22}
//                   />

//                 </div>

//                 <h3 className="mt-3 font-semibold text-slate-800">
//                   No automation steps yet
//                 </h3>

//                 <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
//                   Add your first calculation, validation,
//                   cleaning, condition, or other automation step
//                   below.
//                 </p>

//               </div>

//             )}

//           </div>

//           {/* Builder */}

//           <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/30 p-5">

//             <div className="mb-4">

//               <h3 className="font-semibold text-slate-900">
//                 Add automation step
//               </h3>

//               <p className="mt-1 text-sm text-slate-500">
//                 Select a file to load its columns, then choose
//                 the operation you want ExcelFlow to perform.
//               </p>

//             </div>

//             <TextColumnBuilder
//               onAdd={
//                 addStep
//               }
//             />

//           </div>

//           {/* Save */}

//           <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">

//             <button
//               className="btn-primary"
//               disabled={busy}
//               onClick={
//                 saveEditor
//               }
//             >

//               <Save size={15} />

//               {busy
//                 ? "Saving..."
//                 : editor.id
//                   ? "Update automation"
//                   : "Save automation"}

//             </button>

//             <button
//               className="btn-ghost"
//               onClick={() =>
//                 setEditor(null)
//               }
//               disabled={busy}
//             >
//               Cancel
//             </button>

//           </div>

//         </div>
//       )}

//       {/* =================================================
//           RUN AUTOMATION
//       ================================================= */}

//       {runFor && (
//         <div className="card mb-6 border-brand-200">

//           <div className="flex items-start gap-3">

//             <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">

//               <Play size={18} />

//             </div>

//             <div>

//               <h2 className="font-semibold text-slate-900">
//                 Run "{runFor.name}"
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Select the Excel file that should be processed
//                 by this automation.
//               </p>

//             </div>

//           </div>

//           <div className="mt-5">

//             <label className="label">
//               Select input file
//             </label>

//             <FileSelect
//               files={
//                 files
//               }
//               value={
//                 fileId
//               }
//               onChange={
//                 setFileId
//               }
//               placeholder="Choose an Excel or CSV file..."
//             />

//           </div>

//           <div className="mt-5 flex flex-wrap gap-2">

//             <button
//               className="btn-primary"
//               disabled={
//                 !fileId ||
//                 busy
//               }
//               onClick={
//                 runIt
//               }
//             >

//               <Play size={15} />

//               {busy
//                 ? "Running automation..."
//                 : "Run automation"}

//             </button>

//             <button
//               className="btn-ghost"
//               onClick={() => {
//                 setRunFor(
//                   null
//                 );

//                 setFileId(
//                   ""
//                 );
//               }}
//             >
//               Cancel
//             </button>

//           </div>

//         </div>
//       )}

//       {/* =================================================
//           SAVED AUTOMATIONS
//       ================================================= */}

//       {items &&
//         !items.length &&
//         !editor && (
//           <Empty>
//             No saved automations yet. Create your first workflow
//             using the "New automation" button.
//           </Empty>
//         )}

//       <div className="grid gap-5 lg:grid-cols-2">

//         {items?.map(
//           (automation) => (

//             <AutomationCard
//               key={
//                 automation._id
//               }
//               automation={
//                 automation
//               }

//               onRun={() => {
//                 setRunFor(
//                   automation
//                 );

//                 setFileId(
//                   ""
//                 );
//               }}

//               onEdit={() =>
//                 editAutomation(
//                   automation
//                 )
//               }

//               onDuplicate={() =>
//                 wrap(
//                   () =>
//                     automationApi.duplicate(
//                       automation._id
//                     ),
//                   "Automation duplicated successfully."
//                 )
//               }

//               onDelete={() =>
//                 window.confirm(
//                   `Delete "${automation.name}"?`
//                 ) &&
//                 wrap(
//                   () =>
//                     automationApi.remove(
//                       automation._id
//                     ),
//                   "Automation deleted successfully."
//                 )
//               }
//             />

//           )
//         )}

//       </div>
//     </>
//   );
// }


// /* =====================================================
//    AUTOMATION STEP
// ===================================================== */

// function AutomationStep({
//   rule,
//   index,
//   total,
//   onRemove,
//   onMoveUp,
//   onMoveDown,
// }) {
//   const description =
//     useMemo(
//       () =>
//         describeRule(
//           rule
//         ),
//       [rule]
//     );

//   return (
//     <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

//       <div className="flex items-start gap-3">

//         <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
//           {index + 1}
//         </div>

//         <div className="min-w-0 flex-1">

//           <div className="flex flex-wrap items-center gap-2">

//             <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">
//               Step {index + 1}
//             </span>

//             <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
//               Automation rule
//             </span>

//           </div>

//           <p className="mt-1 break-words text-sm font-medium text-slate-800">
//             {description}
//           </p>

//         </div>

//         <div className="flex shrink-0 items-center gap-1">

//           <button
//             type="button"
//             disabled={
//               index === 0
//             }
//             onClick={
//               onMoveUp
//             }
//             className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
//             title="Move up"
//           >
//             ↑
//           </button>

//           <button
//             type="button"
//             disabled={
//               index ===
//               total - 1
//             }
//             onClick={
//               onMoveDown
//             }
//             className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
//             title="Move down"
//           >
//             ↓
//           </button>

//           <button
//             type="button"
//             onClick={
//               onRemove
//             }
//             className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
//             title="Remove step"
//           >
//             <Trash2
//               size={15}
//             />
//           </button>

//         </div>

//       </div>

//     </div>
//   );
// }


// /* =====================================================
//    AUTOMATION CARD
// ===================================================== */

// function AutomationCard({
//   automation,
//   onRun,
//   onEdit,
//   onDuplicate,
//   onDelete,
// }) {
//   const rules =
//     automation.rules ||
//     [];

//   return (
//     <div className="card transition-shadow hover:shadow-md">

//       <div className="flex items-start justify-between gap-3">

//         <div className="flex min-w-0 items-start gap-3">

//           <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">

//             <Workflow
//               size={19}
//             />

//           </div>

//           <div className="min-w-0">

//             <h3 className="font-semibold text-slate-900">
//               {
//                 automation.name
//               }
//             </h3>

//             <p className="mt-1 text-sm text-slate-500">
//               {automation.description ||
//                 "No description provided."}
//             </p>

//           </div>

//         </div>

//         <span className="whitespace-nowrap text-xs text-slate-400">
//           {formatDate(
//             automation.updatedAt
//           )}
//         </span>

//       </div>

//       {/* Steps */}

//       <div className="mt-4 rounded-lg bg-slate-50 p-3">

//         <div className="mb-2 flex items-center justify-between">

//           <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
//             Workflow
//           </span>

//           <span className="text-xs text-slate-400">

//             {rules.length}{" "}

//             {rules.length ===
//             1
//               ? "step"
//               : "steps"}

//           </span>

//         </div>

//         {rules.length ? (

//           <ol className="space-y-2">

//             {rules.map(
//               (
//                 rule,
//                 index
//               ) => (

//                 <li
//                   key={
//                     index
//                   }
//                   className="flex items-start gap-2 text-sm text-slate-600"
//                 >

//                   <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[10px] font-semibold text-brand-700 shadow-sm">
//                     {index + 1}
//                   </span>

//                   <span className="break-words">
//                     {describeRule(
//                       rule
//                     )}
//                   </span>

//                 </li>

//               )
//             )}

//           </ol>

//         ) : (

//           <p className="text-sm text-slate-400">
//             No steps configured.
//           </p>

//         )}

//       </div>

//       {/* Actions */}

//       <div className="mt-4 flex flex-wrap gap-2">

//         <button
//           className="btn-primary"
//           onClick={
//             onRun
//           }
//         >
//           <Play
//             size={14}
//           />

//           Run
//         </button>

//         <button
//           className="btn-outline"
//           onClick={
//             onEdit
//           }
//         >
//           <Pencil
//             size={14}
//           />

//           Edit
//         </button>

//         <button
//           className="btn-outline"
//           onClick={
//             onDuplicate
//           }
//         >
//           <Copy
//             size={14}
//           />

//           Duplicate
//         </button>

//         <button
//           className="btn-danger"
//           onClick={
//             onDelete
//           }
//         >
//           <Trash2
//             size={14}
//           />

//           Delete
//         </button>

//       </div>

//     </div>
//   );
// }


// /* =====================================================
//    COLUMN / FORMULA BUILDER
// ===================================================== */

// function TextColumnBuilder({
//   onAdd,
// }) {
//   const [files, setFiles] =
//     useState([]);

//   const [fileId, setFileId] =
//     useState("");

//   const [columns, setColumns] =
//     useState([]);

//   const [
//     loadingColumns,
//     setLoadingColumns,
//   ] = useState(false);

//   /* =====================================================
//      LOAD FILES
//   ===================================================== */

//   useEffect(() => {
//     fileApi
//       .list()
//       .then(setFiles)
//       .catch(() =>
//         setFiles([])
//       );
//   }, []);

//   /* =====================================================
//      LOAD COLUMNS
//   ===================================================== */

//   useEffect(() => {
//     if (!fileId) {
//       setColumns([]);
//       return;
//     }

//     setLoadingColumns(
//       true
//     );

//     fileApi
//       .get(fileId)
//       .then((file) => {
//         setColumns(
//           Array.isArray(
//             file?.columns
//           )
//             ? file.columns
//             : []
//         );
//       })
//       .catch(() => {
//         setColumns([]);
//       })
//       .finally(() => {
//         setLoadingColumns(
//           false
//         );
//       });
//   }, [fileId]);

//   return (
//     <div>

//       {/* Source file */}

//       <div className="max-w-xl">

//         <label className="label">
//           Use columns from a file
//         </label>

//         <FileSelect
//           files={
//             files
//           }
//           value={
//             fileId
//           }
//           onChange={
//             setFileId
//           }
//           placeholder="Select a sample Excel/CSV file..."
//         />

//       </div>

//       {/* File information */}

//       {fileId &&
//         !loadingColumns && (

//           <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">

//             <CheckCircle2
//               size={16}
//             />

//             <span>

//               {columns.length}{" "}

//               column
//               {columns.length ===
//               1
//                 ? ""
//                 : "s"}{" "}
//               loaded from the selected file.

//             </span>

//           </div>

//         )}

//       {loadingColumns && (

//         <div className="mt-4 text-sm text-slate-500">
//           Loading columns...
//         </div>

//       )}

//       {/* Formula builder */}

//       <div className="mt-5">

//         {columns.length >
//         0 ? (

//           <FormulaBuilder
//             columns={
//               columns
//             }
//             onApply={
//               onAdd
//             }
//             onAdd={
//               onAdd
//             }
//             busy={
//               loadingColumns
//             }
//           />

//         ) : (

//           <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">

//             <FileSpreadsheet
//               size={28}
//               className="mx-auto text-slate-400"
//             />

//             <h4 className="mt-3 font-medium text-slate-800">
//               Select a source file
//             </h4>

//             <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
//               ExcelFlow will load the column names from your
//               Excel/CSV file so you can create automation
//               rules without typing column names manually.
//             </p>

//           </div>

//         )}

//       </div>

//     </div>
//   );
// }
import { useEffect, useMemo, useState } from "react";

import {
  CheckCircle2,
  Copy,
  FileSpreadsheet,
  Pencil,
  Play,
  Plus,
  Save,
  Trash2,
  Workflow,
  X,
} from "lucide-react";

import FormulaBuilder from "../components/FormulaBuilder.jsx";

import {
  Empty,
  FileSelect,
  Notice,
  PageHeader,
} from "../components/ui.jsx";

import {
  automationApi,
  fileApi,
  errorMessage,
} from "../services/api.js";

import { describeRule } from "../utils/describeRule.js";
import { formatDate } from "../utils/format.js";


/* =====================================================
   MAIN AUTOMATIONS PAGE
===================================================== */

export default function Automations() {
  const [items, setItems] = useState(null);
  const [files, setFiles] = useState([]);

  const [editor, setEditor] = useState(null);

  const [runFor, setRunFor] = useState(null);
  const [fileId, setFileId] = useState("");

  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);


  /* =====================================================
     LOAD AUTOMATIONS
  ===================================================== */

  const load = async () => {
    try {
      const data = await automationApi.list();
      setItems(data);
    } catch (err) {
      setNotice({
        type: "error",
        text: errorMessage(err),
      });
    }
  };


  /* =====================================================
     LOAD FILES
  ===================================================== */

  const loadFiles = async () => {
    try {
      const data = await fileApi.list();
      setFiles(data);
    } catch {
      setFiles([]);
    }
  };


  useEffect(() => {
    load();
    loadFiles();
  }, []);


  /* =====================================================
     COMMON ACTION WRAPPER
  ===================================================== */

  const wrap = async (fn, successMessage) => {
    setBusy(true);
    setNotice(null);

    try {
      const result = await fn();

      if (successMessage) {
        const message =
          typeof successMessage === "function"
            ? successMessage(result)
            : successMessage;

        setNotice({
          type: "success",
          text: message,
        });
      }

      await load();

      return true;
    } catch (err) {
      console.error("ACTION ERROR:", err);

      setNotice({
        type: "error",
        text: errorMessage(err),
      });

      return false;
    } finally {
      setBusy(false);
    }
  };


  /* =====================================================
     CREATE AUTOMATION
  ===================================================== */

  const createAutomation = () => {
    setNotice(null);

    setEditor({
      name: "",
      description: "",
      rules: [],
      sourceFileId: "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  /* =====================================================
     EDIT AUTOMATION
  ===================================================== */

  const editAutomation = (automation) => {
    setNotice(null);

    setEditor({
      id: automation._id,
      name: automation.name || "",
      description: automation.description || "",
      rules: automation.rules || [],
      sourceFileId: "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  /* =====================================================
     SAVE AUTOMATION
  ===================================================== */

  const saveEditor = async () => {
    if (!editor.name.trim()) {
      setNotice({
        type: "error",
        text: "Please enter an automation name.",
      });

      return;
    }

    if (!editor.rules.length) {
      setNotice({
        type: "error",
        text: "Add at least one automation step before saving.",
      });

      return;
    }

    const payload = {
      name: editor.name.trim(),
      description: editor.description.trim(),
      rules: editor.rules,
    };

    const ok = await wrap(
      () =>
        editor.id
          ? automationApi.update(
              editor.id,
              payload
            )
          : automationApi.create(payload),
      "Automation saved successfully."
    );

    if (ok) {
      setEditor(null);
    }
  };


  /* =====================================================
     ADD AUTOMATION STEP
  ===================================================== */

  const addStep = (rule, err) => {
    if (err) {
      setNotice({
        type: "error",
        text: err,
      });

      return;
    }

    if (!rule) {
      setNotice({
        type: "error",
        text: "Unable to create automation step.",
      });

      return;
    }

    setEditor((current) => ({
      ...current,
      rules: [
        ...current.rules,
        rule,
      ],
    }));

    setNotice({
      type: "success",
      text: "Automation step added.",
    });
  };


  /* =====================================================
     REMOVE STEP
  ===================================================== */

  const removeStep = (index) => {
    setEditor((current) => ({
      ...current,
      rules: current.rules.filter(
        (_, i) => i !== index
      ),
    }));
  };


  /* =====================================================
     MOVE STEP
  ===================================================== */

  const moveStep = (index, direction) => {
    setEditor((current) => {
      const rules = [...current.rules];

      const newIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        newIndex < 0 ||
        newIndex >= rules.length
      ) {
        return current;
      }

      [
        rules[index],
        rules[newIndex],
      ] = [
        rules[newIndex],
        rules[index],
      ];

      return {
        ...current,
        rules,
      };
    });
  };


  /* =====================================================
     FORMAT AUTOMATION RESULT
  ===================================================== */

  const formatAutomationResult = (result) => {
    /*
     * Backend normally returns:
     *
     * {
     *   results: [
     *     {
     *       label: "AVERAGE of Salary",
     *       value: 35666.67
     *     }
     *   ]
     * }
     *
     * These fallbacks make the frontend a little safer
     * if the response is wrapped differently.
     */

    const results =
      Array.isArray(result?.results)
        ? result.results
        : Array.isArray(result?.data?.results)
          ? result.data.results
          : [];

    return results.map((item) => {
      let label = String(
        item?.label || "Result"
      );

      /*
       * Backend:
       * AVERAGE of Salary
       *
       * Frontend:
       * Average Salary
       */

      label = label
        .replace(
          /^AVERAGE\s+OF\s+/i,
          "Average "
        )
        .replace(
          /^SUM\s+OF\s+/i,
          "Total "
        )
        .replace(
          /^MIN\s+OF\s+/i,
          "Minimum "
        )
        .replace(
          /^MAX\s+OF\s+/i,
          "Maximum "
        )
        .replace(
          /^COUNT\s+OF\s+/i,
          "Count "
        );

      const rawValue = item?.value;

      if (
        typeof rawValue === "number"
      ) {
        return {
          label,
          value:
            rawValue.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            ),
          rawValue,
          isNumber: true,
        };
      }

      return {
        label,
        value:
          rawValue ?? "",
        rawValue,
        isNumber: false,
      };
    });
  };


  /* =====================================================
     FORMAT RESULT FOR USER
  ===================================================== */

  const formatResultLine = (item) => {
    const label = String(
      item?.label || ""
    ).toLowerCase();

    /*
     * Salary / money related results
     * get ₹.
     */

    const isCurrency =
      label.includes("salary") ||
      label.includes("amount") ||
      label.includes("price") ||
      label.includes("cost") ||
      label.includes("revenue") ||
      label.includes("income");

    if (
      item.isNumber &&
      isCurrency
    ) {
      return `${item.label}: ₹${item.value}`;
    }

    return `${item.label}: ${item.value}`;
  };


  /* =====================================================
     RUN AUTOMATION
  ===================================================== */

  const runIt = async () => {
    /*
     * Check automation.
     */

    if (!runFor?._id) {
      setNotice({
        type: "error",
        text: "No automation selected.",
      });

      return;
    }

    /*
     * Check input file.
     */

    if (!fileId) {
      setNotice({
        type: "error",
        text: "Please select a file to process.",
      });

      return;
    }

    /*
     * Start loading state.
     */

    setBusy(true);
    setNotice(null);

    try {
      console.log(
        "================================"
      );

      console.log(
        "RUNNING EXCELFLOW AUTOMATION"
      );

      console.log(
        "Automation ID:",
        runFor._id
      );

      console.log(
        "Automation name:",
        runFor.name
      );

      console.log(
        "File ID:",
        fileId
      );

      console.log(
        "================================"
      );


      /* ===============================================
         CALL BACKEND
      =============================================== */

      const result =
        await automationApi.run(
          runFor._id,
          fileId
        );


      /* ===============================================
         DEBUG RESPONSE
      =============================================== */

      console.log(
        "AUTOMATION RESPONSE:",
        result
      );

      console.log(
        "AUTOMATION RESULTS:",
        result?.results
      );


      /* ===============================================
         READ RESULTS
      =============================================== */

      const calculatedResults =
        formatAutomationResult(
          result
        );


      /* ===============================================
         READ MESSAGES
      =============================================== */

      const messages =
        Array.isArray(
          result?.messages
        )
          ? result.messages
          : [];


      /* ===============================================
         BUILD RESULT MESSAGES
      =============================================== */

      const resultMessages =
        calculatedResults.map(
          formatResultLine
        );


      /* ===============================================
         FINAL NOTICE
      =============================================== */

      const output = [
        "Automation completed successfully.",

        `Processed ${
          result?.rowCount ??
          result?.data?.rowCount ??
          0
        } rows.`,

        ...resultMessages,

        ...messages,
      ].join("\n");


      /*
       * If backend returned no calculated results,
       * tell us clearly instead of silently showing
       * nothing.
       */

      if (
        calculatedResults.length === 0
      ) {
        console.warn(
          "No calculated results were returned by the backend."
        );

        console.warn(
          "Full backend response:",
          result
        );
      }


      setNotice({
        type: "success",
        text: output,
      });


      /* ===============================================
         REFRESH AUTOMATIONS
      =============================================== */

      await load();


      /* ===============================================
         CLOSE RUN PANEL
      =============================================== */

      setRunFor(null);
      setFileId("");
    } catch (err) {
      console.error(
        "================================"
      );

      console.error(
        "AUTOMATION RUN ERROR:",
        err
      );

      console.error(
        "================================"
      );

      setNotice({
        type: "error",
        text: errorMessage(err),
      });
    } finally {
      setBusy(false);
    }
  };


  const totalSteps =
    editor?.rules?.length || 0;


  /* =====================================================
     UI
  ===================================================== */

  return (
    <>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <PageHeader
        title="Automations"
        subtitle="Build reusable workflows that process your Excel data automatically."
      >
        <button
          className="btn-primary"
          onClick={createAutomation}
        >
          <Plus size={16} />
          New automation
        </button>
      </PageHeader>


      {/* =================================================
          NOTIFICATION
      ================================================= */}

      <div className="mb-5">
        <Notice
          notice={notice}
          onClose={() =>
            setNotice(null)
          }
        />
      </div>


      {/* =================================================
          AUTOMATION EDITOR
      ================================================= */}

      {editor && (
        <div className="card mb-6 overflow-hidden">

          {/* Header */}

          <div className="border-b border-slate-200 pb-5">

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-start gap-3">

                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Workflow size={22} />
                </div>

                <div>

                  <h2 className="text-xl font-semibold text-slate-900">
                    {editor.id
                      ? "Edit automation"
                      : "Create automation"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Create multiple steps and run them automatically
                    on compatible Excel files.
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="text-slate-400 hover:text-slate-700"
                onClick={() =>
                  setEditor(null)
                }
              >
                <X size={20} />
              </button>

            </div>

          </div>


          {/* Basic information */}

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            <div>

              <label className="label">
                Automation name
              </label>

              <input
                className="input"
                value={editor.name}
                onChange={(e) =>
                  setEditor({
                    ...editor,
                    name:
                      e.target.value,
                  })
                }
                placeholder="Employee Payroll Automation"
              />

            </div>


            <div>

              <label className="label">
                Description
              </label>

              <input
                className="input"
                value={
                  editor.description
                }
                onChange={(e) =>
                  setEditor({
                    ...editor,
                    description:
                      e.target.value,
                  })
                }
                placeholder="Automatically process employee payroll data"
              />

            </div>

          </div>


          {/* Workflow status */}

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>

                <h3 className="font-semibold text-slate-900">
                  Automation workflow
                </h3>

                <p className="text-sm text-slate-500">
                  Add steps in the order they should run.
                </p>

              </div>

              <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">

                {totalSteps}{" "}

                {totalSteps === 1
                  ? "step"
                  : "steps"}

              </div>

            </div>

          </div>


          {/* Existing steps */}

          <div className="mt-5">

            {editor.rules.length > 0 ? (

              <div className="space-y-3">

                {editor.rules.map(
                  (
                    rule,
                    index
                  ) => (

                    <AutomationStep
                      key={`${index}-${JSON.stringify(
                        rule
                      )}`}
                      rule={rule}
                      index={index}
                      total={
                        editor.rules
                          .length
                      }
                      onRemove={() =>
                        removeStep(
                          index
                        )
                      }
                      onMoveUp={() =>
                        moveStep(
                          index,
                          "up"
                        )
                      }
                      onMoveDown={() =>
                        moveStep(
                          index,
                          "down"
                        )
                      }
                    />

                  )
                )}

              </div>

            ) : (

              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">

                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">

                  <Plus size={22} />

                </div>

                <h3 className="mt-3 font-semibold text-slate-800">
                  No automation steps yet
                </h3>

                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  Add your first calculation, validation,
                  cleaning, condition, or other automation step
                  below.
                </p>

              </div>

            )}

          </div>


          {/* Builder */}

          <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/30 p-5">

            <div className="mb-4">

              <h3 className="font-semibold text-slate-900">
                Add automation step
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Select a file to load its columns, then choose
                the operation you want ExcelFlow to perform.
              </p>

            </div>

            <TextColumnBuilder
              onAdd={addStep}
            />

          </div>


          {/* Save */}

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">

            <button
              className="btn-primary"
              disabled={busy}
              onClick={saveEditor}
            >

              <Save size={15} />

              {busy
                ? "Saving..."
                : editor.id
                  ? "Update automation"
                  : "Save automation"}

            </button>

            <button
              className="btn-ghost"
              onClick={() =>
                setEditor(null)
              }
              disabled={busy}
            >
              Cancel
            </button>

          </div>

        </div>
      )}


      {/* =================================================
          RUN AUTOMATION
      ================================================= */}

      {runFor && (
        <div className="card mb-6 border-brand-200">

          <div className="flex items-start gap-3">

            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">

              <Play size={18} />

            </div>

            <div>

              <h2 className="font-semibold text-slate-900">
                Run "{runFor.name}"
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the Excel file that should be processed
                by this automation.
              </p>

            </div>

          </div>


          <div className="mt-5">

            <label className="label">
              Select input file
            </label>

            <FileSelect
              files={files}
              value={fileId}
              onChange={setFileId}
              placeholder="Choose an Excel or CSV file..."
            />

          </div>


          <div className="mt-5 flex flex-wrap gap-2">

            <button
              type="button"
              className="btn-primary"
              disabled={!fileId || busy}
              onClick={runIt}
            >

              <Play size={15} />

              {busy
                ? "Running automation..."
                : "Run automation"}

            </button>


            <button
              type="button"
              className="btn-ghost"
              disabled={busy}
              onClick={() => {
                setRunFor(null);
                setFileId("");
              }}
            >
              Cancel
            </button>

          </div>

        </div>
      )}


      {/* =================================================
          SAVED AUTOMATIONS
      ================================================= */}

      {items &&
        !items.length &&
        !editor && (
          <Empty>
            No saved automations yet. Create your first workflow
            using the "New automation" button.
          </Empty>
        )}


      <div className="grid gap-5 lg:grid-cols-2">

        {items?.map(
          (automation) => (

            <AutomationCard
              key={automation._id}
              automation={automation}

              onRun={() => {
                setNotice(null);

                setRunFor(
                  automation
                );

                setFileId("");

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}

              onEdit={() =>
                editAutomation(
                  automation
                )
              }

              onDuplicate={() =>
                wrap(
                  () =>
                    automationApi.duplicate(
                      automation._id
                    ),
                  "Automation duplicated successfully."
                )
              }

              onDelete={() =>
                window.confirm(
                  `Delete "${automation.name}"?`
                ) &&
                wrap(
                  () =>
                    automationApi.remove(
                      automation._id
                    ),
                  "Automation deleted successfully."
                )
              }
            />

          )
        )}

      </div>
    </>
  );
}


/* =====================================================
   AUTOMATION STEP
===================================================== */

function AutomationStep({
  rule,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
}) {
  const description = useMemo(
    () =>
      describeRule(rule),
    [rule]
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="flex items-start gap-3">

        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
          {index + 1}
        </div>


        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Step {index + 1}
            </span>

            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
              Automation rule
            </span>

          </div>


          <p className="mt-1 break-words text-sm font-medium text-slate-800">
            {description}
          </p>

        </div>


        <div className="flex shrink-0 items-center gap-1">

          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            title="Move up"
          >
            ↑
          </button>


          <button
            type="button"
            disabled={
              index === total - 1
            }
            onClick={onMoveDown}
            className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            title="Move down"
          >
            ↓
          </button>


          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
            title="Remove step"
          >
            <Trash2 size={15} />
          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   AUTOMATION CARD
===================================================== */

function AutomationCard({
  automation,
  onRun,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const rules =
    automation.rules || [];

  return (
    <div className="card transition-shadow hover:shadow-md">

      <div className="flex items-start justify-between gap-3">

        <div className="flex min-w-0 items-start gap-3">

          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">

            <Workflow size={19} />

          </div>


          <div className="min-w-0">

            <h3 className="font-semibold text-slate-900">
              {automation.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {automation.description ||
                "No description provided."}
            </p>

          </div>

        </div>


        <span className="whitespace-nowrap text-xs text-slate-400">
          {formatDate(
            automation.updatedAt
          )}
        </span>

      </div>


      {/* Steps */}

      <div className="mt-4 rounded-lg bg-slate-50 p-3">

        <div className="mb-2 flex items-center justify-between">

          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Workflow
          </span>

          <span className="text-xs text-slate-400">

            {rules.length}{" "}

            {rules.length === 1
              ? "step"
              : "steps"}

          </span>

        </div>


        {rules.length ? (

          <ol className="space-y-2">

            {rules.map(
              (
                rule,
                index
              ) => (

                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >

                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[10px] font-semibold text-brand-700 shadow-sm">
                    {index + 1}
                  </span>

                  <span className="break-words">
                    {describeRule(
                      rule
                    )}
                  </span>

                </li>

              )
            )}

          </ol>

        ) : (

          <p className="text-sm text-slate-400">
            No steps configured.
          </p>

        )}

      </div>


      {/* Actions */}

      <div className="mt-4 flex flex-wrap gap-2">

        <button
          type="button"
          className="btn-primary"
          onClick={onRun}
        >
          <Play size={14} />
          Run
        </button>


        <button
          type="button"
          className="btn-outline"
          onClick={onEdit}
        >
          <Pencil size={14} />
          Edit
        </button>


        <button
          type="button"
          className="btn-outline"
          onClick={onDuplicate}
        >
          <Copy size={14} />
          Duplicate
        </button>


        <button
          type="button"
          className="btn-danger"
          onClick={onDelete}
        >
          <Trash2 size={14} />
          Delete
        </button>

      </div>

    </div>
  );
}


/* =====================================================
   COLUMN / FORMULA BUILDER
===================================================== */

function TextColumnBuilder({
  onAdd,
}) {
  const [files, setFiles] =
    useState([]);

  const [fileId, setFileId] =
    useState("");

  const [columns, setColumns] =
    useState([]);

  const [
    loadingColumns,
    setLoadingColumns,
  ] = useState(false);


  /* =====================================================
     LOAD FILES
  ===================================================== */

  useEffect(() => {
    fileApi
      .list()
      .then(setFiles)
      .catch(() =>
        setFiles([])
      );
  }, []);


  /* =====================================================
     LOAD COLUMNS
  ===================================================== */

  useEffect(() => {
    if (!fileId) {
      setColumns([]);
      return;
    }

    setLoadingColumns(true);

    fileApi
      .get(fileId)
      .then((file) => {
        setColumns(
          Array.isArray(
            file?.columns
          )
            ? file.columns
            : []
        );
      })
      .catch(() => {
        setColumns([]);
      })
      .finally(() => {
        setLoadingColumns(
          false
        );
      });
  }, [fileId]);


  return (
    <div>

      {/* Source file */}

      <div className="max-w-xl">

        <label className="label">
          Use columns from a file
        </label>

        <FileSelect
          files={files}
          value={fileId}
          onChange={setFileId}
          placeholder="Select a sample Excel/CSV file..."
        />

      </div>


      {/* File information */}

      {fileId &&
        !loadingColumns && (

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">

            <CheckCircle2 size={16} />

            <span>

              {columns.length}{" "}

              column
              {columns.length === 1
                ? ""
                : "s"}{" "}
              loaded from the selected file.

            </span>

          </div>

        )}


      {loadingColumns && (

        <div className="mt-4 text-sm text-slate-500">
          Loading columns...
        </div>

      )}


      {/* Formula builder */}

      <div className="mt-5">

        {columns.length > 0 ? (

          <FormulaBuilder
            columns={columns}
            onApply={onAdd}
            onAdd={onAdd}
            busy={loadingColumns}
          />

        ) : (

          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">

            <FileSpreadsheet
              size={28}
              className="mx-auto text-slate-400"
            />

            <h4 className="mt-3 font-medium text-slate-800">
              Select a source file
            </h4>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              ExcelFlow will load the column names from your
              Excel/CSV file so you can create automation
              rules without typing column names manually.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}