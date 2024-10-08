import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "../../api/apiClient";
import { Button, message, Popconfirm, Table, Input } from "antd";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"; // Import thư viện xlsx

const StudentManagement = () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const inputFileRef = useRef();
    const navigate = useNavigate();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["STUDENTS"],
        queryFn: async () => {
            const res = await apiClient.get("/students");
            return res.data;
        },
        keepPreviousData: true,
    });

    const searchMutation = useMutation({
        mutationFn: async (name) => {
            const res = await apiClient.post(`/students/search?name=${name}`);
            return res.data;
        },
        onSuccess: (data) => {
            setSearchResults(data);
        },
        onError: () => {
            message.error("Không tìm thấy sinh viên nào.");
            setSearchResults([]);
        },
    });

    const { mutate: deleteStudent, isLoading: isDeleting } = useMutation({
        mutationKey: ["DELETE_STUDENT"],
        mutationFn: () => {
            const ids = selectedRows.map((it) => it.id);
            return apiClient.post("/students/delete", { ids });
        },
        onSuccess: () => {
            message.success("Xoá sinh viên thành công");
            refetch();
            setSelectedRows([]);
        },
    });

    const { mutate: copyStudentsMutation } = useMutation({
        mutationFn: (ids) => {
            return apiClient.post("/students/copy", { ids });
        },
        onSuccess: () => {
            message.success("Sao chép sinh viên thành công");
            refetch();
            setSelectedRows([]);
        },
        onError: () => {
            message.error("Đã xảy ra lỗi khi sao chép sinh viên.");
        },
    });

    const copyStudents = () => {
        const ids = selectedRows.map((it) => it.id);
        copyStudentsMutation(ids);
    };

    const { mutate: onStudentImport } = useMutation({
        mutationKey: ["IMPORT_EXCEL"],
        mutationFn: (file) => {
            const formData = new FormData();
            formData.append("file", file);
            return apiClient.post("/students/import", formData);
        },
        onSuccess: () => {
            message.success("Import SV thành công");
            refetch();
        },
        onError: () => {
            message.error("Failed to import");
        },
    });

    const exportToExcel = () => {
        const studentsToExport = selectedRows.length > 0 ? selectedRows : [];
        if (studentsToExport.length === 0) {
            message.warning("Vui lòng chọn ít nhất một sinh viên để xuất.");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(studentsToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
        XLSX.writeFile(workbook, "students.xlsx");
    };

    const columns = [
        {
            title: "STT",
            key: "STT",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Họ tên",
            key: "name",
            dataIndex: "name",
        },
        {
            title: "Email",
            key: "letter",
            dataIndex: "letter",
        },
        {
            title: "Sở thích",
            key: "hobby",
            dataIndex: "hobby",
        },
        {
            title: "Giới tính",
            key: "sex",
            dataIndex: "sex",
            render: (gender) => {
                switch (gender) {
                    case "male":
                        return "Nam";
                    case "female":
                        return "Nữ";
                    default:
                        return "Khác";
                }
            },
        },
        {
            title: "Địa chỉ",
            key: "address",
            dataIndex: "address",
        },
        {
            key: "edit",
            render: (text, record) => (
                <Button type="link" onClick={() => navigate(`/edit/${record.id}`)}>
                    Sửa
                </Button>
            ),
        },
    ];

    const onFileChange = (e) => {
        const file = e.target.files[0];
        onStudentImport(file);
    };

    const handleSearchChange = (e) => {
        const name = e.target.value;
        setSearchName(name);

        if (name) {
            searchMutation.mutate(name);
        } else {
            setSearchResults([]);
        }
    };

    return (
        <>
            <div className="p-3">
                <h1 className="text-center font-semibold text-3xl mt-3 mb-6">Student Management</h1>
                <div className="flex mb-3">
                    {selectedRows.length > 0 && (
                        <Popconfirm
                            title="Xoá sinh viên đã chọn"
                            description="Xác nhận xoá SV?"
                            onConfirm={deleteStudent}
                        >
                            <p className="cursor-pointer text-red-500">Xoá {selectedRows.length} sinh viên</p>
                        </Popconfirm>
                    )}

                    {selectedRows.length > 0 && (
                        <Button type="primary" onClick={copyStudents} disabled={selectedRows.length === 0}>
                            Sao chép {selectedRows.length} sinh viên
                        </Button>
                    )}

                    <div className="ml-auto flex items-center">
                        <Input
                            placeholder="Tìm kiếm theo tên"
                            value={searchName}
                            onChange={handleSearchChange}
                            style={{ width: 200, marginRight: 16 }}
                        />
                        <Button loading={isDeleting} type="primary" onClick={() => inputFileRef.current.click()}>
                            Import Excel
                        </Button>
                        <Button className="ml-4" type="primary" onClick={exportToExcel}>
                            Export Excel
                        </Button>
                        <Link className="ml-4" to={"/add"}>
                            <Button type="primary">Add Student</Button>
                        </Link>
                    </div>
                </div>

                {isLoading && <p>Loading...</p>}
                {isError && <p>Không thể tải dữ liệu.</p>}

                <Table
                    columns={columns}
                    dataSource={searchResults.length > 0 ? searchResults : data || []}
                    scroll={{ x: 1000 }}
                    rowKey="id"
                    rowSelection={{
                        onChange: (_, selectedRows) => {
                            setSelectedRows(selectedRows);
                        },
                        selectedRowKeys: selectedRows.map((it) => it.id),
                    }}
                />
            </div>

            <input
                type="file"
                hidden
                onChange={onFileChange}
                ref={inputFileRef}
                accept=".xlsx"
                onClick={(e) => (e.target.value = "")}
            />
        </>
    );
};

export default StudentManagement;
