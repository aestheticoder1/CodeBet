// src/pages/ContestPage.jsx
import { useLocation, useParams } from "react-router-dom";

const ContestPage = () => {
    const { id } = useParams();
    const { state } = useLocation();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Contest Started!</h1>
            <p className="mt-2">Challenge ID: {id}</p>
            <p className="mt-2 font-semibold">Problem: <a className="text-blue-500" href={state?.problem?.url} target="_blank" rel="noreferrer">{state?.problem?.name}</a></p>
            <p className="mt-2">Time Limit: {state?.timeLimit} minutes</p>
        </div>
    );
};

export default ContestPage;
