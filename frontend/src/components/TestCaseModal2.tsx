import React from "react";

interface TestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: {
    new_test_cases: { linked_requirement: string; reason: string; suggested_title: string }[];
    updated_test_cases: { reason: string; test_case_id: string }[];
    obsolete_test_cases: { reason: string; test_case_id: string }[];
  };
  onAccept: (acceptedTestCases: {
    new_test_cases: { linked_requirement: string; reason: string; suggested_title: string }[];
    updated_test_cases: { reason: string; test_case_id: string }[];
    obsolete_test_cases: { reason: string; test_case_id: string }[];
  }) => void;
}

export default function TestCaseModal2({ isOpen, onClose, results, onAccept }: TestCaseModalProps) {
  if (!isOpen) return null;

  const handleAccept = () => {
    const acceptedTestCases = {
      new_test_cases: results.new_test_cases,
      updated_test_cases: results.updated_test_cases,
      obsolete_test_cases: results.obsolete_test_cases,
    };
    onAccept(acceptedTestCases);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-3/4">
        <h2 className="text-xl font-bold mb-4">Test Case Analysis</h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-green-600">New Test Cases</h3>
          {results.new_test_cases.length > 0 ? (
            <ul>
              {results.new_test_cases.map((testCase, index) => (
                <li key={index} className="mb-2">
                  <strong>{testCase.suggested_title}</strong> (Linked to: {testCase.linked_requirement}) - {testCase.reason}
                </li>
              ))}
            </ul>
          ) : (
            <p>No new test cases.</p>
          )}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-orange-600">Updated Test Cases</h3>
          {results.updated_test_cases.length > 0 ? (
            <ul>
              {results.updated_test_cases.map((testCase, index) => (
                <li key={index} className="mb-2">
                  <strong>{testCase.test_case_id}</strong> - {testCase.reason}
                </li>
              ))}
            </ul>
          ) : (
            <p>No updated test cases.</p>
          )}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-red-600">Obsolete Test Cases</h3>
          {results.obsolete_test_cases.length > 0 ? (
            <ul>
              {results.obsolete_test_cases.map((testCase, index) => (
                <li key={index} className="mb-2">
                  <strong>{testCase.test_case_id}</strong> - {testCase.reason}
                </li>
              ))}
            </ul>
          ) : (
            <p>No obsolete test cases.</p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Accept and Update
          </button>
        </div>
      </div>
    </div>
  );
}
