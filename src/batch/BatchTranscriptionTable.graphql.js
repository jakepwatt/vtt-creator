import {gql} from '@apollo/client'

export const BatchTranscriptionTable_jobsFragment = gql`
	fragment BatchTranscriptionTable_jobs on TranscriptionJob {
		id
		cost
		pricePerMin
		fileDuration
		language
		state
		createdAt
		inputFile {
			id
			originalFileName
		}
	}
`

export const BatchTranscriptionTable_totalsFragment = gql`
	fragment BatchTranscriptionTable_totals on TranscriptionJobsAggregation {
		totalCost
		totalDuration
	}
`

export const BatchTranscriptionTableGetJobsQuery = gql`
	query BatchTranscriptionTableGetJobs($batchId: String!, $offset: Int!, $limit: Int!) {
		transcriptionJobs(batchId: $batchId) {
			nodes(offset: $offset, limit: $limit) {
				...BatchTranscriptionTable_jobs
			}
			totalCount
			aggregate {
				...BatchTranscriptionTable_totals
			}
		}
	}
	${BatchTranscriptionTable_jobsFragment}
	${BatchTranscriptionTable_totalsFragment}
`

export function appendJobToBatch(cache, batchId, job) {
	const data = cache.readQuery({
		query: BatchTranscriptionTableGetJobsQuery,
		variables: {batchId, offset: 0, limit: 10},
	})

	if (data) {
		const nodes = [job, ...(data.transcriptionJobs?.nodes || [])]
		cache.writeQuery({
			query: BatchTranscriptionTableGetJobsQuery,
			variables: {batchId, offset: 0, limit: 10},
			data: {
				...data,
				transcriptionJobs: {
					...data.transcriptionJobs,
					nodes,
					aggregate: {
						...data.transcriptionJobs.aggregate,
						totalCost: data.transcriptionJobs.aggregate.totalCost + job.cost,
					},
					totalCount: data.transcriptionJobs.totalCount + 1,
				},
			},
		})
	}
}

export function updateBatchLanguage(cache, batchId, newLanguage) {
	const data = cache.readQuery({
		query: BatchTranscriptionTableGetJobsQuery,
		variables: {batchId, offset: 0, limit: 100000},
	})

	if (data) {
		cache.writeQuery({
			query: BatchTranscriptionTableGetJobsQuery,
			data: {
				...data,
				transcriptionJobs: {
					...data.transcriptionJobs,
					nodes: data.transcriptionJobs.nodes.map(n => ({...n, language: newLanguage})),
				},
			},
		})
	}
}
