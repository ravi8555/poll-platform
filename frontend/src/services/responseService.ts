// frontend/src/services/responseService.ts

import api from "./api";
import type { ResponseSubmit } from "../types/types";

export const responseService = {
    async submitResponse(data:ResponseSubmit): Promise<{message:string, pollId:string}>{
        const response = await api.post('responses/submit', data);
        return response.data

    },
    async getPollResponses(pollId:string):Promise<any[]>{
        const response = await api.get(`/responses/poll/${pollId}/response`);{
        return response.data
        }
    },
    async getLiveCount(pollId:string): Promise<{pollId:string, responseCount:number}>{
        const response = await api.get(`/responses/poll/${pollId}/live-count`)
        return response.data
    }

}