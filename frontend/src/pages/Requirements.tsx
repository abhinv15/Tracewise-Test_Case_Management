import { useState } from "react";
import data from "../data/requirements.json";
import { Requirement } from "../types/requirement";
import RequirementTable from "../components/RequirementTable";
import RequirementDetails from "../components/RequirementDetails";
import RequirementModal from "../components/RequirementModal";
import TestCaseModal2 from "../components/TestCaseModal2"; // Import the new modal

export default function Requirements() {
  const [requirements, setRequirements] = useState<Requirement[]>(data);
  const [selected, setSelected] = useState<Requirement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editRequirement, setEditRequirement] = useState<Requirement | null>(null);
  const [testCaseResults, setTestCaseResults] = useState(null); // State for test case results
  const [showTestCaseModal, setShowTestCaseModal] = useState(false); // State for showing the test case modal

  const deleteRequirement = (id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const updateBackendNewRequirements = async (updatedRequirements: Requirement[]) => {
    try {
      await fetch("http://127.0.0.1:5000/update-new-requirements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRequirements),
      });
    } catch (error) {
      console.error("Failed to update newRequirements.json in the backend:", error);
    }
  };

  const fetchTestCaseAnalysis = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
      });
      const data = await response.json();
      if (data.status === "success") {
        setTestCaseResults(data.results);
        setShowTestCaseModal(true); // Show the test case modal
      } else {
        console.error("Failed to fetch test case analysis:", data.message);
      }
    } catch (error) {
      console.error("Error fetching test case analysis:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Requirements</h1>
        <button
          onClick={() => {
            setEditRequirement(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Requirement
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <RequirementTable
            requirements={requirements}
            onDelete={deleteRequirement}
            onSelect={(r) => setSelected(r)}
          />
        </div>
        <div className="col-span-1 border rounded p-4 bg-gray-50">
          <RequirementDetails
            selected={selected}
            onEdit={() => {
              setEditRequirement(selected);
              setShowModal(true);
            }}
          />
        </div>
      </div>

      <RequirementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialData={editRequirement}
        onSubmit={async (data: Requirement) => {
          let updatedRequirements;
          if (editRequirement) {
            updatedRequirements = requirements.map((req) =>
              req.id === data.id ? data : req
            );
            setRequirements(updatedRequirements);
            setSelected(data);
          } else {
            updatedRequirements = [...requirements, data];
            setRequirements(updatedRequirements);
          }
          setShowModal(false);

          // Update the backend with the new requirements
          await updateBackendNewRequirements(updatedRequirements);

          // Fetch test case analysis
          await fetchTestCaseAnalysis();
        }}
      />

      {testCaseResults && (
        <TestCaseModal2
          isOpen={showTestCaseModal}
          onClose={() => setShowTestCaseModal(false)}
          results={testCaseResults}
          onAccept={() => {
            console.log("Test case results accepted");
            setShowTestCaseModal(false);
          }}
        />
      )}
    </div>
  );
}
