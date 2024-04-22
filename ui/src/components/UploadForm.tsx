import React, { useState } from 'react';
import AWS from 'aws-sdk';
import UploadHistory from './UploadHistory';


//Localstack configuration
const s3 = new AWS.S3({
    region: 'eu-west-1', // The value here doesn't matter.
    endpoint: 'http://localhost:4566', // This is the localstack EDGE_PORT
    s3ForcePathStyle: true,
    credentials: new AWS.Credentials('000000000000', 'na') 
});

//Live Configuration
// const s3 = new AWS.S3({
//     region: process.env.AWS_REGION,
//     accessKeyId: process.env.ACCESS_KEY,
//     secretAccessKey: process.env.SECRET_KEY,
// });


const UploadForm: React.FC = () => {
    const [uploads, setUploads] = React.useState<any[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files && e.target.files[0];
        if (selectedFile) {
            const fileNameParts = selectedFile.name.split('.');
            const fileExtension = fileNameParts[fileNameParts.length - 1];
            if (fileExtension.toLowerCase() !== 'csv') {
                setError('Please select a CSV file');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
            setUploadMessage(null);
        }
    };

    const handleSubmit = () => {
        if (!file) {
            setError('Please select a file');
            return;
        }
        const params = {
            Bucket: process.env.REACT_APP_BUCKET_NAME || "",
            Key: file.name,
            Body: file,
        };

        s3.putObject(params, (err, data) => {
            if (err) {
                console.error('Error uploading file:', err);
                setError('Error uploading file');
                const newUpload = { filename: file.name, status: 'error', timestamp: new Date() }
                setUploads([...uploads, newUpload]);
                setUploadMessage(null);
            } else {
                console.log('File uploaded successfully:', data);
                setUploadMessage('File uploaded successfully');
                const newUpload = { filename: file.name, status: 'success', timestamp: new Date() }
                setUploads([...uploads, newUpload]);
                setError(null);
            }
        });
    };

    return (
        <div className="py-6 px-9" data-testid="upload-form">
            <div className="mb-6 pt-4">
                <label className="mb-5 block text-xl font-semibold text-[#07074D]">
                    SECR - Upload Tool
                </label>
                <div className="mb-8">
                    <input type="file" name="file" id="file" className="sr-only" onChange={handleFileChange} />
                    <label
                        htmlFor="file"
                        className="relative flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-[#e0e0e0] p-12 text-center"
                    >
                        <div>
                            <span className="mb-2 block text-xl font-semibold text-[#07074D]">
                                Drop files here
                            </span>
                            <span className="mb-2 block text-base font-medium text-[#6B7280]">
                                Or
                            </span>
                            <span
                                className="inline-flex rounded border border-[#e0e0e0] py-2 px-7 text-base font-medium text-[#07074D]"
                            >
                                Browse
                            </span>
                        </div>
                    </label>
                </div>

                {file &&
                    <div className="flex items-center justify-between">
                        <span className="truncate pr-3 text-base font-medium text-[#07074D]">
                            {file?.name}
                        </span>
                    </div>
                }
                <br />
                <UploadHistory uploads={uploads} />
            </div>

            <div>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                {uploadMessage && <div style={{ color: 'green' }}>{uploadMessage}</div>}
                <button className="hover:shadow-form w-full rounded-md bg-[#6A64F1] py-3 px-8 text-center text-base font-semibold text-white outline-none" onClick={handleSubmit} >
                    Upload File
                </button>
            </div>
        </div>
    );
};

export default UploadForm;
