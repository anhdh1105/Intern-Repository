import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddStudent = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: classes, isLoading: classesLoading } = useQuery({
        queryKey: ["classCodes"],
        queryFn: () => axios.get("http://localhost:8080/api/class").then((res) => res.data),
    });

    const { mutate } = useMutation({
        mutationFn: (data) => axios.post("http://localhost:8080/api/students", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            alert("Thêm sinh viên thành công");
            reset();
            navigate("");
        },
        onError: (error) => {
            alert(error?.response?.data?.message || "Có lỗi xảy ra");
        },
    });

    const onSubmit = (data) => {
        const finalData = {
            ...data,
            is_active: data.is_active === "true",
        };
        mutate(finalData);
    };

    return (
        <div className="container mt-5">
            <h2>Thêm Sinh Viên</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            {...register("name", { required: "Name is required" })}
                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Date of Birth</label>
                        <input
                            type="date"
                            {...register("date", { required: "Date is required" })}
                            className={`form-control ${errors.date ? "is-invalid" : ""}`}
                        />
                        {errors.date && <div className="invalid-feedback">{errors.date.message}</div>}
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">City</label>
                        <input
                            type="text"
                            {...register("city", { required: "City is required" })}
                            className={`form-control ${errors.city ? "is-invalid" : ""}`}
                        />
                        {errors.city && <div className="invalid-feedback">{errors.city.message}</div>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Sex</label>
                        <select
                            {...register("sex", { required: "Sex is required" })}
                            className={`form-control ${errors.sex ? "is-invalid" : ""}`}
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                        {errors.sex && <div className="invalid-feedback">{errors.sex.message}</div>}
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Address</label>
                        <input
                            type="text"
                            {...register("address", { required: "Address is required" })}
                            className={`form-control ${errors.address ? "is-invalid" : ""}`}
                        />
                        {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Hobby</label>
                        <input type="text" {...register("hobby")} className="form-control" />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Hair Color</label>
                        <input type="text" {...register("haircolor")} className="form-control" />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Letter</label>
                        <input type="text" {...register("letter")} className="form-control" />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Facebook</label>
                        <input type="text" {...register("facebook")} className="form-control" />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Class Code</label>
                        <select
                            {...register("class_code", { required: "Class code is required" })}
                            className={`form-control ${errors.class_code ? "is-invalid" : ""}`}
                            disabled={classesLoading}
                        >
                            <option value="">Chọn lớp học</option>
                            {classes &&
                                classes.map((classItem) => (
                                    <option key={classItem.id} value={classItem.id}>
                                        {classItem.name}
                                    </option>
                                ))}
                        </select>
                        {errors.class_code && <div className="invalid-feedback">{errors.class_code.message}</div>}
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Account</label>
                        <input
                            type="text"
                            {...register("account", { required: "Account is required" })}
                            className={`form-control ${errors.account ? "is-invalid" : ""}`}
                        />
                        {errors.account && <div className="invalid-feedback">{errors.account.message}</div>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            {...register("password", { required: "Password is required" })}
                            className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        />
                        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea {...register("description")} className="form-control" rows="4"></textarea>
                </div>

                <button type="submit" className="btn btn-primary" disabled={mutate.isLoading}>
                    {mutate.isLoading ? "Adding..." : "Add Student"}
                </button>
            </form>
        </div>
    );
};

export default AddStudent;
