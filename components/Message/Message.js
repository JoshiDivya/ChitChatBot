import { useUser } from "@auth0/nextjs-auth0/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import Markdown from "react-markdown";

export const Message = ({ role, content }) => {
  const { user } = useUser();
  return (
    <div
      className={`grid grid-cols-[30px_1fr] gap-5 p-5 ${role === "assistant" && "bg-gray-600"}`}
    >
      <div>
        {role === "user" && !!user && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            width={30}
            height={30}
            alt={role}
            src={user.picture}
            className="rounded-sm shadow-md shadow-black/50"
          ></img>
        )}
        {role === "assistant" && (
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-sm shadow-md shadow-black/50 bg-gray-600">
            <FontAwesomeIcon
              icon={faRobot}
              className="text-emerald-200"
            ></FontAwesomeIcon>
          </div>
        )}
      </div>
      <div className="prose prose-invert">
        <Markdown>{content}</Markdown>
      </div>
    </div>
  );
};
