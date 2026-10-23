import { NotFoundError, ConflictError} from "../utils/customErrors.js";

 let weldingJobsInMemory = [
    {
        id : "1",
        jobCode: "WELD-001",
        process : "SMAW",
        material: "Acero al carbono Structural A36",
        welderName: "Lester Garcia",
        voltageVolts: 25,
        amperageAmps: 130,
        inspectionPassed: true,
        inspectionDate:"2026-10-01"
    },
    {
         id : "2",
        jobCode: "WELD-003",
        process : "GTAW(TIG)",
        material: "Acero inoxidable 316L",
        welderName: "Kevin Gutierres",
        voltageVolts: 20,
        amperageAmps: 95,
        inspectionPassed: true,
        inspectionDate:"2026-10-05"
    },
    {
         id : "3",
        jobCode: "WELD-003",
        process : "GMAW (MIG/MAG)",
        material: "Aluminio 6061-T6",
        welderName: "Josue Guerra",
        voltageVolts: 22,
        amperageAmps: 160,
        inspectionPassed: false,
        inspectionDate:"2026-10-08"
    }
 ];

 export const getAllWeldingJobsService = async (filters = {})=>{
    let jobs = [...weldingJobsInMemory];
    const { process: processType, material, inspectionPassed}=filters;
     
    if(processType){
        jobs = jobs.filter((j)=>
        j.process.toLowerCase().includes(processType.toLowerCase()));
    }
    if(material){
        jobs = jobs.filter((j)=>
        j.material.toLowerCase().includes(material.toLowerCase()));
    }

    if(inspectionPassed !== undefined){
        const isPassed = inspectionPassed === "true";
        jobs = jobs.filter((j)=>
        j.inspectionPassed === isPassed);
    }

    return jobs;

 };

 export const getWeldingJobByIdService = async (id)=>{
    const job = weldingJobsInMemory.find((j)=> j.id ===String(id));
    if(!job){
        throw new NotFoundError(`El trabajo de soldadura con ID :'${id}' no existe en memoria`);

    }
    return job;
 };

 export const createWeldingJobService = async ({
    jobCode,
    process: processType,
    material,
    welderName,
    voltageVolts,
    amperageAmps,
    inspectionPassed,
    inspectionDate

 }) =>{
    const codeExists = weldingJobsInMemory.some(
        (j)=> j.jobCode.toLowerCase()=== jobCode.toLowerCase()
    );
    if (codeExists){
        throw new ConflictError(`El codigo de soldadura '${jobCode}' ya esta registrado en la memoria`);
    }

    const newJob = {
        id: String(Date.now()),
        jobCode,
        process: processType,
        material,
        welderName,
        voltageVolts: Number(voltageVolts),
        amperageAmps: Number(amperageAmps),
        inspectionPassed: inspectionPassed !== undefined ? Boolean(inspectionPassed): false,
        inspectionDate: inspectionDate || new Date().toISOString().split("T")[0]
    };

    weldingJobsInMemory.push(newJob);
    return newJob;
 };

 export const resetWeldingMemoryService = async ()=>{
    weldingJobsInMemory = [];
    return{message: "La memoria del registro de soldadura ha sido limpiada con exito."};

 };
