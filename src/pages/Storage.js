// frontend/src/pages/Storage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { fetchFiles, uploadFile, deleteFile, renameFile, updateComment, shareFile, clearError } from '../store/fileSlice';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

function Storage() {
    const { username } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { files, loading, error, uploadProgress } = useSelector((state) => state.files);
    const { user } = useSelector((state) => state.auth);
    const [showUpload, setShowUpload] = useState(false);
    const [comment, setComment] = useState('');
    const [editingFile, setEditingFile] = useState(null);
    const [newName, setNewName] = useState('');
    const [newComment, setNewComment] = useState('');

    const isAdmin = user?.is_admin;
    const targetUser = username || user?.username;
    const isOwnStorage = !username || username === user?.username;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!isAdmin && username && username !== user.username) {
            navigate('/storage');
            return;
        }
        dispatch(fetchFiles(username || undefined));
        return () => {
            dispatch(clearError());
        };
    }, [dispatch, username, user, isAdmin, navigate]);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            dispatch(uploadFile({
                file,
                comment,
                username: username || undefined,
            }));
            setComment('');
            setShowUpload(false);
        }
    }, [dispatch, comment, username]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
    });

    const handleDelete = async (fileId) => {
        if (window.confirm('Удалить этот файл?')) {
            await dispatch(deleteFile(fileId));
        }
    };

    const handleRename = async (fileId) => {
        if (newName.trim()) {
            await dispatch(renameFile({ fileId, newName: newName.trim() }));
            setEditingFile(null);
            setNewName('');
        }
    };

    const handleComment = async (fileId) => {
        await dispatch(updateComment({ fileId, comment: newComment }));
        setEditingFile(null);
        setNewComment('');
    };

    const handleShare = async (fileId, share) => {
        await dispatch(shareFile({ fileId, share }));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Ссылка скопирована в буфер обмена');
    };

    if (loading && files.length === 0) {
        return <div className="loading">Загрузка...</div>;
    }

    return (
        <div className="page storage-page">
            <div className="storage-header">
                <h2>
                    {isOwnStorage ? 'Мои файлы' : `Файлы пользователя ${username}`}
                </h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowUpload(!showUpload)}
                >
                    {showUpload ? 'Отмена' : 'Загрузить файл'}
                </button>
            </div>

            {showUpload && (
                <div className="upload-area" {...getRootProps()}>
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p>Отпустите файл для загрузки...</p>
                    ) : (
                        <div>
                            <p>Перетащите файл сюда или кликните для выбора</p>
                            <input
                                type="text"
                                placeholder="Комментарий к файлу"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                    {uploadProgress > 0 && (
                        <div className="progress-bar">
                            <div style={{ width: `${uploadProgress}%` }} />
                        </div>
                    )}
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            {files.length === 0 && !loading ? (
                <div className="empty-state">
                    <p>Нет загруженных файлов</p>
                </div>
            ) : (
                <div className="file-list">
                    <table className="file-table">
                        <thead>
                            <tr>
                                <th>Имя файла</th>
                                <th>Размер</th>
                                <th>Комментарий</th>
                                <th>Дата загрузки</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => (
                                <tr key={file.id} className="file-row">
                                    <td className="file-name">
                                        {editingFile === file.id ? (
                                            <div className="edit-inline">
                                                <input
                                                    type="text"
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleRename(file.id)}
                                                    autoFocus
                                                />
                                                <button onClick={() => handleRename(file.id)}>✓</button>
                                                <button onClick={() => {
                                                    setEditingFile(null);
                                                    setNewName('');
                                                }}>✕</button>
                                            </div>
                                        ) : (
                                            <span
                                                className="file-link"
                                                onClick={() => window.open(file.download_url, '_blank')}
                                            >
                                                {file.original_name}
                                            </span>
                                        )}
                                    </td>
                                    <td>{formatFileSize(file.file_size)}</td>
                                    <td className="file-comment">
                                        {editingFile === file.id ? (
                                            <div className="edit-inline">
                                                <input
                                                    type="text"
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Комментарий"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleComment(file.id)}
                                                />
                                                <button onClick={() => handleComment(file.id)}>✓</button>
                                                <button onClick={() => {
                                                    setEditingFile(null);
                                                    setNewComment('');
                                                }}>✕</button>
                                            </div>
                                        ) : (
                                            <span>{file.comment || '-'}</span>
                                        )}
                                    </td>
                                    <td>
                                        {format(new Date(file.uploaded_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                                    </td>
                                    <td className="file-actions">
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => window.open(file.download_url, '_blank')}
                                            title="Скачать"
                                        >
                                            ⬇
                                        </button>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => {
                                                setEditingFile(file.id);
                                                setNewName(file.original_name);
                                                setNewComment(file.comment || '');
                                            }}
                                            title="Редактировать"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            className={`btn btn-sm ${file.is_shared ? 'btn-success' : 'btn-secondary'}`}
                                            onClick={() => handleShare(file.id, !file.is_shared)}
                                            title={file.is_shared ? 'Отключить публичный доступ' : 'Включить публичный доступ'}
                                        >
                                            {file.is_shared ? '🔗' : '🔒'}
                                        </button>
                                        {file.is_shared && file.share_token && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => copyToClipboard(
                                                    `${window.location.origin}/api/storage/shared/${file.share_token}/`
                                                )}
                                                title="Копировать ссылку"
                                            >
                                                📋
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(file.id)}
                                            title="Удалить"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Storage;