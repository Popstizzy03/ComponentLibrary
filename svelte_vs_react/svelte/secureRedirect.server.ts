// import { loginUser } from '$lib/server/auth'
// import { redirect } from '@sveltejs/kit'

import { handleLoginRedirect } from "$lib/util";

/*export const actions = {
    default: async (event) => {
        loginUser(event)
        const redirectTo = event .url.searchParams.get('redirectTo')
        if (redirectTo) {
            throw redirectTo(302, `/${redirectTo.slice(1)}`)
            // if someone run localhost:https://malicious.com
            // This url won't run as the app only allow redirection from our domain/site only 
        }
        throw redirectTo(301, "/")
    }
}*/

export const load = async (event) => {
    if (!event.locals.user) {
        throw redirect(302, handleLoginRedirect(event))
    }
}