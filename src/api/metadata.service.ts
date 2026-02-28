import { BASE_URL } from "@/lib/constants";
import axios from "axios";
interface IPostMetaData {
  figmaElementId: string;
  documentKey: string;
  parentDocumentKey: string | null;
  jiraTask?: string;
  implementationStatus?: string;
  program?: string;
  softwareRelease?: string;
  widgetClass?: string;
  deviceTaggings?: string;
  smrUseCase?: string;
  smrReference?: string;
  smrRestrictionGroup?: string;
  comments?: string;
  smrBehaviour?: string;
  oldVersion?: string;
  gridId?: string;
  mkStatus?: string;
  mkId?: string;
  engineeringEnglish?: string;
}
interface IMetaDataResponse extends IPostMetaData {
  createdAt: string;
  createdBy: string;
  version: string;
  id: string;
  requirementsLinkage: string | null;
  tcRequirements: string | null;
  userStory: string | null;
  uniqueId:string;
}
export const getFigmaInstance = async (
  documentKey: string,
  figmaInstanceId: string,
  token: string
): Promise<IMetaDataResponse> => {
  const { data } = await axios.get<IMetaDataResponse>(
    `${BASE_URL}/v3/figma-document/${documentKey}/figma-element/${figmaInstanceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};
