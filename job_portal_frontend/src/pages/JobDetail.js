import React from "react";
import { useParams } from "react-router-dom";

// PUBLIC_INTERFACE
function JobDetail() {
  /** Detail view for a single job posting */
  const { jobId } = useParams();
  return (
    <div className="page-content">
      <h1>Job Detail</h1>
      <p>Detail for job ID: <b>{jobId}</b></p>
    </div>
  );
}
export default JobDetail;
