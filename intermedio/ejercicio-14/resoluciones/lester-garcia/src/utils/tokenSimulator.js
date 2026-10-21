import { createHmac } from 'node:crypto';

const getSecret = ()=> process.env.TOKEN_SECRET_SALT || "default_fallback_secret_salt";

export const generateSimulatedToken = (payload, expiresInMs = 1000 * 60 * 60 * 2)=>{
    const expiresAt = Date.now() + expiresInMs;
    const tokenData = {
        ...payload,
        expiresAt
    };

    const encodedPayload = Buffer.from(JSON.stringify(tokenData)).toString("base64url");
    const signature = createHmac("sha256", getSecret()).update(encodedPayload).digest("hex");
   
    return `${encodedPayload}.${signature}`;
};

export const verifySimulatedToken = (rawToken) => {
    if (!rawToken || typeof rawToken != "string" || !rawToken.includes(".")){
        return null;
    }

    const [ encodedPayload, clientSignature ] = rawToken.split(".");
    const expectedSignature = createHmac("sha256", getSecret()).update(encodedPayload).digest("hex");

    if(clientSignature !== expectedSignature){
        return null;
    }

    try {
        const jsonString = Buffer.from(encodedPayload, "base64url").toString("utf-8");
        const data = JSON.parse(jsonString);

        if(Date.now() > data.expireAt){
            return null ;

        }

        return data;
    }catch{
        return null;
    }
};