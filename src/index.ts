import fetch from 'node-fetch';

import star from "url:./assets/star-24.svg";
import fork from "url:./assets/repo-forked-24.svg";
import license from "url:./assets/law-16.svg";
import dotenv from 'dotenv';
dotenv.config();
//~

interface UserData {
	user: {
		bio: string;
		avatarUrl: string;
		name: string;
		login: string;
	};
}
interface UserSearchData {
	search: {
		userCount: number;
	};
}
interface Repository {
	description: string;
	forkCount: string;
	homepageUrl: string | undefined;
	url: string;
	resourcePath: string;
	stargazerCount: number;
	id: string;
	name: string;
	nameWithOwner: string;
	owner: {
		login: string;
	};
	isFork: boolean;
	isArchived: boolean;
	isPrivate: boolean;
	licenseInfo: {
		name: string;
	};
	parent:
		| {
				nameWithOwner: string;
				url: string;
		  }
		| undefined;
	primaryLanguage: {
		color: string;
		name: string;
	};
	pushedAt: string;
	updatedAt: string;
}
interface RepositoriesData {
	repositoryOwner: {
		repositories: {
			totalCount: number;
			nodes: Repository[];
		};
	};
}
console.log(process.env.GITHUB_PERSONAL_ACCESS_TOKEN);
const endpoint = "https://api.github.com/graphql";

const mainFunc = async (login: string) => {
	try {
		const addRepo = (repo: Repository): string => {
			const updatedAt = new Date(repo.updatedAt).toString().split(' ');
			return `
						<article class='repo'>
							<div class="repo_title flex-row">
								<h3><a href='${repo.url}'>${repo.name}</a></h3>
								${repo.isArchived? `<p>Archived</p>`: ''}
								${repo.isPrivate? `<p>Private</p>`: ''}
							</div>
							${
								repo.isFork && repo.parent
									? `<p class="repo_forked_title">Forked from <a href='${repo.parent.url}'>${repo.parent.nameWithOwner}</a></p>`
									: ""
							}
							<div class="repo_star flex-row">
								<img src=${star} width="15px" height="15px"/>
								<p>Star</p>
							</div>
							${repo.description ? `<p class="repo_desc">${repo.description}</p>` : ""}
							<div class="repo_details flex-row">
								<div class="flex-row repo_details-contents">
									<div class="major-lang-color small-icon" style="background-color: ${
										repo.primaryLanguage?.color
									};"></div>
									<p class="major-lang-name">${repo.primaryLanguage?.name}</p>
								</div>
								${
									repo.stargazerCount
										? `<div class="flex-row repo_details-contents">
										<div class="small-icon">
											<img src=${star} width="15px" height="15px"/>
										</div>
										<p>${repo.stargazerCount}</p>
									</div>`
										: ""
								}
								${
									repo.forkCount
										? `<div class="flex-row repo_details-contents">
										<div class="small-icon">
											<img src=${fork} width="15px" height="15px"/>
										</div>
										<p>${repo.forkCount}</p>
									</div>`
										: ""
								}
								${
									repo.licenseInfo
										? `<div class="flex-row repo_details-contents">
										<div class="small-icon">
											<img src=${license} width="15px" height="15px"/>
										</div>
										<p>${repo.licenseInfo.name}</p>
									</div>`
										: ""
								}
								<div class="flex-row repo_details-contents">
									<p>Updated on ${updatedAt[2]} ${updatedAt[1]}</p>
								</div>
							</div>
							<hr class="main-body-ruler repo_ruler" />
						</article>`;
		};
		const userQuery = `
			query getUserDetails($login: String!){
				user(login: $login) {
					bio
					avatarUrl
					name
					login
				}
			}
		`;
		const repoQuery = `
			query getUserRepos($login: String!){
				repositoryOwner(login: $login) {
					repositories(
						orderBy: { field: UPDATED_AT, direction: DESC }
						first: 20
					) {
						totalCount
						nodes {
							description
							forkCount
							homepageUrl
							url
							resourcePath
							stargazerCount
							id
							name
							nameWithOwner
							owner {
								login
							}
							isFork
							isArchived
							isPrivate
							licenseInfo {
								name
							}
							parent {
								nameWithOwner
								url
							}
							primaryLanguage {
								color
								name
							}
							pushedAt
							updatedAt
						}
					}
				}
			}
		`;
		const variables = {
			login: login.trim()
		}

		const userDataResponse = await window.fetch(endpoint, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query: userQuery,
				variables
			}),
		});
		const userDataResponseData = await userDataResponse.json();
		const userData: UserData = userDataResponseData.data;
		console.log(userData);
		const userImg: HTMLImageElement | null = document.querySelector(
			".main-profile_img"
		);
		const userImgBig: HTMLImageElement | null = document.querySelector(
			".nav_user-img-sm"
		);
		const userImgSm: HTMLImageElement | null = document.querySelector(
			".nav_sm-user-img"
		);
		const usernameSm: HTMLImageElement | null = document.querySelector(
			".nav_sm-user-name"
		);
		const displayname = document.querySelector(
			".main-profile_data_displayname"
		);
		const username = document.querySelector(
			".main-profile_data_username"
		);
		const desc = document.querySelector(".main-profile_data_desc");
		if(userImg && userImgBig && displayname && username && desc && userImgSm && usernameSm){
			userImg.setAttribute("src", userData.user.avatarUrl);
			userImgBig.setAttribute("src", userData.user.avatarUrl);
			userImgSm.setAttribute("src", userData.user.avatarUrl);
			usernameSm.innerHTML = userData.user.name;
			displayname.innerHTML = userData.user.name;
			username.innerHTML = userData.user.login;
			desc.innerHTML = userData.user.bio;
		}

		const repoDataResponse = await window.fetch(endpoint,{
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query: repoQuery,
				variables
			}),
		});
		//
		const repoDataResponseData = await repoDataResponse.json();
		const repoData: RepositoriesData = repoDataResponseData.data;
		const { repositories } = repoData.repositoryOwner;
		console.log(repoData);
		const noRepo = document.querySelector(".main-body-no-repo");
		const repoCount = document.querySelector(".repo-count");
		const noRepoPlural = document.querySelector(".main-body-no-repo-plural");
		const repoList = document.querySelector(".repo-list");

		if(noRepo && repoCount && noRepoPlural && repoList){
			noRepo.innerHTML = repositories.totalCount.toString();
			repoCount.innerHTML = repositories.totalCount.toString();
			noRepoPlural.innerHTML = repositories.totalCount > 1 ? "ies" : "y";
			repoList.innerHTML = repositories.nodes.map(addRepo).join(" ");
		}
	} catch (error) {
		console.log(error);
	}
};

const index = async () =>{
	try{
		const hamburger = document.querySelector('.hamburger');
		hamburger?.addEventListener('click', ()=>{
			const dropdown = document.querySelector('.nav-sm_dropdown');
			if(dropdown){
				dropdown.classList.toggle('flex-col');
				dropdown.classList.toggle('hide');
			}
		});
		const submitBtn = document.querySelector('.start_box-button');
		submitBtn?.addEventListener('click', async ()=>{
			submitBtn.classList.add('start_box-button-inactive');
			submitBtn.setAttribute('diabled', 'true');
			const usernameInput: HTMLInputElement| null = document.querySelector('.username_input');
			if(usernameInput && usernameInput.value){
				const userQuery = `
					query searchUser($login: String!){
						search(query: $login, type: USER) {
					    userCount
					  }
					}
				`;
				const variables = {
					login: usernameInput.value.trim()
				}
				//
				const userDataResponse = await window.fetch(endpoint,{
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						query: userQuery,
						variables
					}),
				});
				const userDataResponseData = await userDataResponse.json();
				const userData: UserSearchData = userDataResponseData.data;
				if(userData.search.userCount > 0){
					await mainFunc(usernameInput.value);
					setTimeout(async ()=>{
						await mainFunc('otagera');
						const start = document.querySelector('.start');
						if(start){
							start.classList.add('hide');
							start.classList.remove('show');
						}
						const main = document.querySelector('.main');
						if(main){
							main.classList.add('show');
							main.classList.remove('hide');
						}
					}, 2000);
				}else{
					const startError = document.querySelector('.start_error');
					if(startError){
						startError.classList.add('show');
						startError.classList.remove('hide');
						setTimeout(()=>{
							startError.classList.add('hide');
							startError.classList.remove('show');
							submitBtn.classList.remove('start_box-button-inactive');
							submitBtn.setAttribute('diabled', 'false');
							usernameInput.value = '';
						}, 2000);
					}
				}
				// disabled="true"
			}
		});
	}catch(error){
		console.error(error);
	}
};
(async ()=>{
	await index();
})();