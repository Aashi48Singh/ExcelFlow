// import { useEffect, useState } from 'react';
// import { LayoutTemplate } from 'lucide-react';
// import { Notice, PageHeader } from '../components/ui.jsx';
// import { automationApi, templateApi, errorMessage } from '../services/api.js';
// import { describeRule } from '../utils/describeRule.js';

// export default function Templates() {
//   const [templates, setTemplates] = useState([]);
//   const [notice, setNotice] = useState(null);
//   useEffect(() => { templateApi.list().then(setTemplates).catch((e) => setNotice({ type: 'error', text: errorMessage(e) })); }, []);

//   const use = async (t) => {
//     try {
//       await automationApi.create({ name: t.name, description: t.description, rules: t.rules });
//       setNotice({ type: 'success', text: `“${t.name}” was added to your Automations. Run it on a compatible file from there.` });
//     } catch (e) { setNotice({ type: 'error', text: errorMessage(e) }); }
//   };
//   return (
//     <>
//       <PageHeader title="Templates" subtitle="Ready-made automations. Columns are matched by name (case and spaces ignored)." />
//       <div className="mb-4"><Notice notice={notice} onClose={() => setNotice(null)} /></div>
//       <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//         {templates.map((t) => (
//           <div key={t.id} className="card flex flex-col">
//             <div className="flex items-center gap-2 font-semibold"><LayoutTemplate size={18} className="text-brand-600" /> {t.name}</div>
//             <p className="mt-1 text-sm text-slate-500">{t.description}</p>
//             <p className="mt-2 text-xs text-slate-500">Expects columns: <span className="font-medium text-slate-700">{t.expects.join(', ')}</span></p>
//             <ol className="mt-3 flex-1 list-inside list-decimal space-y-0.5 text-xs text-slate-600">{t.rules.map((r, i) => <li key={i}>{describeRule(r)}</li>)}</ol>
//             <button className="btn-primary mt-4" onClick={() => use(t)}>Use template</button>
//           </div>
//         ))}
//       </div>
//     </>
//   );
// }
import { useEffect, useState } from "react";
import { LayoutTemplate, CheckCircle2 } from "lucide-react";

import {
  Notice,
  PageHeader,
} from "../components/ui.jsx";

import {
  automationApi,
  templateApi,
  errorMessage,
} from "../services/api.js";

import { describeRule } from "../utils/describeRule.js";

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [notice, setNotice] = useState(null);

  const [loading, setLoading] = useState(true);
  const [usingTemplate, setUsingTemplate] = useState(null);

  /* =====================================================
     LOAD TEMPLATES
  ===================================================== */

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);

      try {
        const data = await templateApi.list();

        setTemplates(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        setNotice({
          type: "error",
          text: errorMessage(err),
        });
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  /* =====================================================
     USE TEMPLATE
  ===================================================== */

  const useTemplate = async (template) => {
    if (!template) {
      return;
    }

    setUsingTemplate(template.id);
    setNotice(null);

    try {
      /* -----------------------------------------------
         Create automation from template
      ------------------------------------------------ */

      const created =
        await automationApi.create({
          name: template.name,
          description:
            template.description || "",
          rules:
            Array.isArray(template.rules)
              ? template.rules
              : [],
        });

      /* -----------------------------------------------
         Success message
      ------------------------------------------------ */

      setNotice({
        type: "success",
        text: `"${template.name}" was added to your Automations.`,
      });

      /*
       * Small delay so user can see success message.
       * Then open Automations page.
       */

      setTimeout(() => {
        window.location.href =
          "/automations";
      }, 700);

      return created;
    } catch (err) {
      setNotice({
        type: "error",
        text: errorMessage(err),
      });

      setUsingTemplate(null);
    }
  };

  /* =====================================================
     LOADING STATE
  ===================================================== */

  if (loading) {
    return (
      <>
        <PageHeader
          title="Templates"
          subtitle="Ready-made automations for common Excel tasks."
        />

        <div className="card py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading templates...
          </p>
        </div>
      </>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <>
      <PageHeader
        title="Templates"
        subtitle="Ready-made automations. Columns are matched by name (case and spaces ignored)."
      />

      {/* =================================================
          NOTICE
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
          EMPTY STATE
      ================================================= */}

      {!templates.length && (
        <div className="card py-12 text-center">
          <LayoutTemplate
            size={40}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-4 font-semibold text-slate-800">
            No templates available
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            There are currently no automation
            templates available.
          </p>
        </div>
      )}

      {/* =================================================
          TEMPLATE GRID
      ================================================= */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => {
          const isUsing =
            usingTemplate ===
            template.id;

          const rules =
            Array.isArray(
              template.rules
            )
              ? template.rules
              : [];

          const expects =
            Array.isArray(
              template.expects
            )
              ? template.expects
              : [];

          return (
            <div
              key={
                template.id ||
                template.name
              }
              className="card flex flex-col transition-shadow hover:shadow-md"
            >
              {/* =========================================
                  TEMPLATE HEADER
              ========================================= */}

              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <LayoutTemplate
                    size={19}
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">
                    {template.name}
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {template.description ||
                      "Ready-made Excel automation."}
                  </p>
                </div>
              </div>

              {/* =========================================
                  EXPECTED COLUMNS
              ========================================= */}

              {expects.length > 0 && (
                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Expected columns
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {expects.map(
                      (column, index) => (
                        <span key={column}>
                          <span className="font-medium">
                            {column}
                          </span>

                          {index <
                            expects.length -
                              1 && (
                            <span>
                              ,{" "}
                            </span>
                          )}
                        </span>
                      )
                    )}
                  </p>
                </div>
              )}

              {/* =========================================
                  RULES
              ========================================= */}

              <div className="mt-4 flex-1">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Automation steps
                </p>

                {rules.length > 0 ? (
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
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-[10px] font-semibold text-brand-700">
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
                    No automation steps.
                  </p>
                )}
              </div>

              {/* =========================================
                  USE TEMPLATE BUTTON
              ========================================= */}

              <button
                type="button"
                className="btn-primary mt-5 w-full justify-center"
                disabled={
                  isUsing ||
                  !rules.length
                }
                onClick={() =>
                  useTemplate(
                    template
                  )
                }
              >
                {isUsing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                    Creating automation...
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      size={16}
                    />

                    Use template
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}