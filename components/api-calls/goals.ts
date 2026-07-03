import {
    Goal,
    GoalContribution,
    GoalContributionPayload,
    GoalPayload,
    GoalQuery,
    GoalSummary,
} from "@/Interfaces/Interfaces";
import axiosClient from "@/utils/apiClient";

export interface PagedResponse<T> {
    content: T[];
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}

const buildGoalQueryString = (params?: GoalQuery): string => {
    if (!params) return "";
    const search = new URLSearchParams();
    if (params.page !== undefined) search.set("page", String(params.page));
    if (params.size !== undefined) search.set("size", String(params.size));
    if (params.sort) search.set("sort", params.sort);
    const qs = search.toString();
    return qs ? `?${qs}` : "";
};

const buildContributionQueryString = (params?: GoalQuery): string => {
    if (!params) return "";
    const search = new URLSearchParams();
    if (params.page !== undefined) search.set("page", String(params.page));
    if (params.size !== undefined) search.set("size", String(params.size));
    if (params.sort) search.set("sort", params.sort);
    const qs = search.toString();
    return qs ? `?${qs}` : "";
};

const emptyPaged = <T>(params?: GoalQuery): PagedResponse<T> => ({
    content: [],
    currentPage: params?.page ?? 1,
    pageSize: params?.size ?? 0,
    totalElements: 0,
    totalPages: 0,
});

export const getGoals = async (
    userId: number,
    query?: GoalQuery
): Promise<PagedResponse<Goal>> => {
    try {
        const response = await axiosClient.get<PagedResponse<Goal>>(
            `users/${userId}/goals${buildGoalQueryString(query)}`
        );
        if (response.data && Array.isArray((response.data as PagedResponse<Goal>).content)) {
            return response.data;
        }
        const raw = response.data as unknown as Goal[];
        return {
            content: raw || [],
            currentPage: query?.page ?? 1,
            pageSize: raw?.length ?? query?.size ?? 0,
            totalElements: raw?.length ?? 0,
            totalPages: 1,
        };
    } catch (err) {
        console.error("Error fetching goals:", err);
        return emptyPaged<Goal>(query);
    }
};

export const getGoal = async (userId: number, goalId: number): Promise<Goal> => {
    const response = await axiosClient.get<Goal>(`users/${userId}/goals/${goalId}`);
    return response.data;
};

export const createGoal = async (userId: number, payload: GoalPayload): Promise<Goal> => {
    const response = await axiosClient.post<Goal>(`users/${userId}/goals`, payload);
    return response.data;
};

export const updateGoal = async (
    userId: number,
    goalId: number,
    payload: GoalPayload
): Promise<Goal> => {
    const response = await axiosClient.put<Goal>(
        `users/${userId}/goals/${goalId}`,
        payload
    );
    return response.data;
};

export const deleteGoal = async (userId: number, goalId: number): Promise<void> => {
    await axiosClient.delete(`users/${userId}/goals/${goalId}`);
};

export const getGoalSummary = async (userId: number): Promise<GoalSummary> => {
    const response = await axiosClient.get<GoalSummary>(`users/${userId}/goals/summary`);
    return response.data;
};

export const getGoalContributions = async (
    userId: number,
    goalId: number,
    query?: GoalQuery
): Promise<PagedResponse<GoalContribution>> => {
    try {
        const response = await axiosClient.get<PagedResponse<GoalContribution>>(
            `users/${userId}/goals/${goalId}/contributions${buildContributionQueryString(query)}`
        );
        if (
            response.data &&
            Array.isArray((response.data as PagedResponse<GoalContribution>).content)
        ) {
            return response.data;
        }
        const raw = response.data as unknown as GoalContribution[];
        return {
            content: raw || [],
            currentPage: query?.page ?? 1,
            pageSize: raw?.length ?? query?.size ?? 0,
            totalElements: raw?.length ?? 0,
            totalPages: 1,
        };
    } catch (err) {
        console.error("Error fetching goal contributions:", err);
        return emptyPaged<GoalContribution>(query);
    }
};

export const createGoalContribution = async (
    userId: number,
    goalId: number,
    payload: GoalContributionPayload
): Promise<Goal> => {
    const response = await axiosClient.post<Goal>(
        `users/${userId}/goals/${goalId}/contributions`,
        payload
    );
    return response.data;
};

export const deleteGoalContribution = async (
    userId: number,
    goalId: number,
    contributionId: number
): Promise<Goal> => {
    const response = await axiosClient.delete<Goal>(
        `users/${userId}/goals/${goalId}/contributions/${contributionId}`
    );
    return response.data;
};
