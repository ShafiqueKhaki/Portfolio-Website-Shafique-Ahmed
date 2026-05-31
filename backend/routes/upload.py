from fastapi import APIRouter, Depends, UploadFile, File, Query
from auth.dependencies import get_current_admin
from services.cloudinary_service import upload_file

admin_router = APIRouter(prefix="/api/admin/upload", tags=["admin-upload"])


@admin_router.post("", dependencies=[Depends(get_current_admin)])
async def upload(
    file: UploadFile = File(...),
    folder: str = Query("portfolio"),
):
    result = await upload_file(file, folder=folder)
    return result
