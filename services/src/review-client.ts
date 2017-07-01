import { auth } from "./auth";
import gql from "graphql-tag";
import { gqlRequest, restPost } from "./gql-client";
export interface CreateReviewBody {
  installationId: string;
  owner: string;
  repo: string;
  commit: string;
}

export const createReviewMutation = `
  mutation createReview($prid: ID!) {
    addPullRequestReview(input: {
      clientMutationId: "0",
      pullRequestId: $prid,
      event: REQUEST_CHANGES,
      body: "test"
    }) {
      clientMutationId
    }
  }
`;

export interface PrsData {
  data: {
    repository: {
      pullRequests: {
        nodes: {
          id: string;
          title: string;
          number: number;
          reviews: {
            totalCount: number;
            nodes: {
              author: {
                login: string;
              };
            }[];
          };
          commits: {
            nodes: {
              commit: {
                oid: string;
              }
            }[];
          }
        }[]
      }
    }
  }
}

export function updateReview(params: CreateReviewBody) {
  return auth(params.installationId).then(token => {
    console.log("token", token);
    const query = `
      query prs($count: Int, $owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          pullRequests(last: $count, states: OPEN) {
            nodes {
              id
              title
              number
              reviews(last: 100) {
                totalCount
                nodes {
                  author {
                    login,
                  }
                }
              }
              commits(last: 100) {
                nodes {
                  commit {
                    oid
                  }
                }
              }
            }
          }
        }
      }
    `;
    return gqlRequest(query, token, {
      count: 3,
      owner: params.owner,
      repo: params.repo,
    })
    .then((data: PrsData) => {
      const pullRequests = data.data.repository.pullRequests;
      return pullRequests;
    })
    .then(prs => {
      return Promise.all(prs.nodes.map(pr => {
        // const v = {
        //   prid: pr.id,
        // };
        // console.log("params", v);
        // return gqlRequest(createReviewMutation, token, v);
        return restPost(`/repos/${params.owner}/${params.repo}/pulls/${pr.number}/reviews`, token, {
          body: "test",
          event: "COMMENT",
        })
      }));
    })
    .catch(err => {
      console.error(err.error);
      return Promise.reject(err.error);
    })
    ;
  });
}
