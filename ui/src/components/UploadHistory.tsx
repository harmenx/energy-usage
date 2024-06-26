import React, { useState } from 'react';
import { Pagination } from './Pagination';

interface Upload {
    status: string;
    filename: string;
    timestamp: Date;
}

interface UploadInterface {
    uploads: Upload[] 
}
const UploadHistory: React.FC<UploadInterface> = ({ uploads }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const uploadsPerPage = 5;

    const indexOfLastUpload = currentPage * uploadsPerPage;
    const indexOfFirstUpload = indexOfLastUpload - uploadsPerPage;
    const currentUploads = uploads.slice(indexOfFirstUpload, indexOfLastUpload);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
    return (
        <div data-testid="upload-history">
            <label className="mb-5 block text-xl font-semibold text-[#07074D]">
                Upload History
            </label>
            <ul>
                {currentUploads.map((upload, index) => (
                    <div className={`mb-5 rounded-md ${upload.status === 'success' ? 'bg-green-500' : 'bg-red-500 '}  py-4 px-8`}>
                        <div className="flex items-center justify-between">
                            <span className="truncate pr-3 text-base font-medium text-[#07074D]">
                                {upload.filename} - {upload.timestamp.toString()}
                            </span>
                        </div>
                    </div>
                ))}
            </ul>
            <Pagination numberOfPages={ Math.ceil(uploads.length / uploadsPerPage) } paginate={paginate} />
        </div>
    );
};

export default UploadHistory;
