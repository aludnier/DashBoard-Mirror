import { useEffect, useState } from "react";
import { api, getUserSession } from "../client";
import "./youtubeWidget.css"

function YoutubeGoogleWidget() {

    const [apiResponse, setApiResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const user = getUserSession();

    useEffect(() => {

        if (!user?.id) {
            setLoading(false);
            return;
        }

        api.get(`provider/google/${user.id}/ytplaylist`)
            .then((response) => {
                console.log("[YOUTUBE]", response.data);
                setApiResponse(response.data);
            })
            .catch((error) => {
                console.error("[YOUTUBE]", error);
                setError(error);
            })
            .finally(() => {
                setLoading(false);
            });

    }, [user?.id]);

    if (loading) {
        return <div>Connecting...</div>;
    }

    if (error) {
        return <div>Cannot access YouTube.</div>;
    }

    if (!apiResponse) {
        return <div>No Data.</div>;
    }

    return (
        <div className="playlists">
            {apiResponse.playlists?.map((playlist) => (
                <div key={playlist.id} className="playlist">
                    <h3> <a target="_blank" href={`https://www.youtube.com/playlist?list=${playlist.id}`}>{playlist.snippet.title}</a></h3>
                    <img src={playlist.snippet.thumbnails.default.url}></img>
                    <p>
                        {playlist.snippet.description}
                    </p>

                    <span>
                        {playlist.contentDetails.itemCount} vidéos
                    </span>
                </div>
            ))}
        </div>
    );
}

export default YoutubeGoogleWidget;
