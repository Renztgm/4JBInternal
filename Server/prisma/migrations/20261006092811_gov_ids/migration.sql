-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "employeeNo" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "baseSalary" INTEGER NOT NULL,
    "hireDate" DATETIME NOT NULL,
    "tin" TEXT,
    "sssNo" TEXT,
    "philhealth" TEXT,
    "pagibig" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PayrollRun" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdById" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    CONSTRAINT "PayrollRun_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payslip" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "runId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "gross" INTEGER NOT NULL,
    "totalDeductions" INTEGER NOT NULL,
    "net" INTEGER NOT NULL,
    CONSTRAINT "Payslip_runId_fkey" FOREIGN KEY ("runId") REFERENCES "PayrollRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PayslipItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payslipId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    CONSTRAINT "PayslipItem_payslipId_fkey" FOREIGN KEY ("payslipId") REFERENCES "Payslip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeNo_key" ON "Employee"("employeeNo");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRun_periodStart_periodEnd_key" ON "PayrollRun"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_runId_employeeId_key" ON "Payslip"("runId", "employeeId");
